#!/usr/bin/env bash
# تیرداد — اسکریپت راه‌اندازی سرور پروداکشن روی Ubuntu 24.04
# اجرا: به‌عنوان root روی سرور تازه اجرا کنید:
#   bash setup-server.sh
# ایمن برای اجرای دوباره: اگه SSH وسط کار قطع شد (مثلاً به‌خاطر ری‌استارت
# خودکار سیستم بعد از آپدیت کرنل)، فقط دوباره همین دستور رو بزنید.
set -euo pipefail

echo "== 1. آپدیت سیستم =="
apt update && apt upgrade -y
apt install -y curl git ufw nginx

echo "== 2. فایروال =="
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "== 3. نصب Node.js 22 (LTS) =="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "== 4. نصب PostgreSQL 16 =="
apt install -y postgresql postgresql-contrib

echo "== 5. ساخت کاربر و دیتابیس Postgres =="
# ایمن برای اجرای دوباره: اگه رول از قبل باشه فقط پسوردش رو رو به مقدار جدید ست می‌کنه
# (تا با DATABASE_URL که پایین‌تر توی .env نوشته می‌شه هماهنگ بمونه)، و دیتابیس رو فقط اگه نبود می‌سازه.
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=')
su - postgres -c "psql -c \"DO \\\$\\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'tirdad') THEN CREATE ROLE tirdad LOGIN PASSWORD '${DB_PASSWORD}'; ELSE ALTER ROLE tirdad WITH PASSWORD '${DB_PASSWORD}'; END IF; END \\\$\\\$;\""
su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname = 'tirdad'\"" | grep -q 1 || su - postgres -c "psql -c \"CREATE DATABASE tirdad OWNER tirdad;\""

echo "== 6. نصب PM2 (مدیریت پروسه Node) =="
npm install -g pm2

echo "== 7. ساخت کاربر غیر-root برای اجرای اپ =="
if ! id -u tirdad-app >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" tirdad-app
fi

echo "== 8. دریافت پروژه =="
# git clone روی این سرور به‌طور مکرر با SSL connection timeout شکست خورد
# (به‌احتمال زیاد مشکل مسیریابی IPv6)، در حالی که curl ساده جواب می‌داد.
# پس به‌جای git clone، تاربال رو مستقیم با curl (با اجبار IPv4) می‌گیریم.
BRANCH="claude/ui-ux-pro-max-skill-qdlm2j"
fetch_project() {
  su - tirdad-app -c "curl -4 -fsSL --connect-timeout 20 --max-time 180 https://github.com/milad13711/tirdad/archive/refs/heads/${BRANCH}.tar.gz -o /tmp/tirdad.tar.gz" || return 1
  rm -rf /home/tirdad-app/tirdad
  su - tirdad-app -c "mkdir -p ~/tirdad && tar -xzf /tmp/tirdad.tar.gz -C ~/tirdad --strip-components=1"
}
for attempt in 1 2 3 4 5 6 7 8; do
  if fetch_project; then
    break
  fi
  if [ "$attempt" -eq 8 ]; then
    echo "دریافت پروژه بعد از ۸ تلاش ناموفق بود. اسکریپت رو دوباره اجرا کنید."
    exit 1
  fi
  echo "تلاش $attempt برای دریافت پروژه ناموفق بود، ۱۵ ثانیه صبر و تلاش دوباره..."
  sleep 15
done

echo "== 9. ساخت فایل .env (باید مقادیر واقعی رو بعداً پر کنید) =="
JWT_ACCESS=$(openssl rand -base64 48 | tr -d '\n')
JWT_REFRESH=$(openssl rand -base64 48 | tr -d '\n')
su - tirdad-app -c "cat > ~/tirdad/.env" <<EOF
DATABASE_URL="postgresql://tirdad:${DB_PASSWORD}@localhost:5432/tirdad"

JWT_ACCESS_SECRET="${JWT_ACCESS}"
JWT_REFRESH_SECRET="${JWT_REFRESH}"

SMS_PROVIDER="mock"
LIMO_API_KEY=""
LIMO_PATTERN_ID=""

ZARINPAL_MERCHANT_ID=""
ZARINPAL_SANDBOX="true"
NEXT_PUBLIC_APP_URL="http://45.94.215.22"

TELEGRAM_BOT_TOKEN=""
TELEGRAM_ADMIN_CHAT_ID=""
EOF

echo "== 10. نصب پکیج‌ها، مایگریشن، ساخت (build) =="
su - tirdad-app -c "cd ~/tirdad && npm install"
su - tirdad-app -c "cd ~/tirdad && npx prisma migrate deploy"
su - tirdad-app -c "cd ~/tirdad && npm run build"

echo "== 11. اجرا با PM2 =="
su - tirdad-app -c "pm2 delete tirdad" 2>/dev/null || true
su - tirdad-app -c "cd ~/tirdad && pm2 start npm --name tirdad -- start"
su - tirdad-app -c "pm2 save"
env PATH=$PATH:/usr/bin pm2 startup systemd -u tirdad-app --hp /home/tirdad-app | tail -1 > /tmp/pm2-startup-cmd.sh
bash /tmp/pm2-startup-cmd.sh || true

echo "== 12. تنظیم Nginx به‌عنوان reverse proxy =="
cat > /etc/nginx/sites-available/tirdad <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
ln -sf /etc/nginx/sites-available/tirdad /etc/nginx/sites-enabled/tirdad
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "========================================================"
echo "تمام شد. اپ الان روی http://45.94.215.22 در دسترسه."
echo ""
echo "رمز دیتابیس (جایی نگهش دارید): ${DB_PASSWORD}"
echo ""
echo "مراحل باقی‌مانده که باید دستی انجام بدید:"
echo "1. اگه دامنه دارید: DNS رو به این IP بزنید، بعد:"
echo "   apt install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d yourdomain.com"
echo "   و NEXT_PUBLIC_APP_URL توی .env رو به https://yourdomain.com عوض کنید."
echo "2. seed دیتابیس (کاربر ادمین نمونه و غیره):"
echo "   su - tirdad-app -c 'cd ~/tirdad && npm run db:seed'"
echo "3. ZARINPAL_MERCHANT_ID واقعی رو توی .env بذارید و ZARINPAL_SANDBOX رو false کنید."
echo "4. اگه از SMS واقعی استفاده می‌کنید، SMS_PROVIDER=limo و LIMO_API_KEY/LIMO_PATTERN_ID رو ست کنید."
echo "5. بعد از هر تغییر توی .env: su - tirdad-app -c 'pm2 restart tirdad'"
echo "========================================================"
