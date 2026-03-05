# Database setup (MySQL)

The error **"Authentication failed... the provided database credentials for \`root\` are not valid"** means your `.env` has a wrong MySQL password or user.

## Fix

1. **Open `.env`** and find `DATABASE_URL`. It looks like:
   ```
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/onmart"
   ```

2. **Set the correct MySQL password:**
   - Replace `YOUR_PASSWORD` with the password you use to log in to MySQL (the one you set when you installed MySQL, or the one that works in MySQL Workbench / command line).
   - If MySQL has no password for `root`, use empty: `mysql://root:@localhost:3306/onmart`
   - If you use a different user (e.g. `onmart_user`), use: `mysql://onmart_user:password@localhost:3306/onmart`

3. **Create the database** (if it doesn’t exist):
   - Open MySQL (command line or Workbench).
   - Run: `CREATE DATABASE IF NOT EXISTS onmart;`

4. **Apply schema and seed:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Restart the dev server** after changing `.env` (stop `npm run dev` and run it again).

## Admin login (after DB is working)

- **Email:** `admin@onmart.com`
- **Password:** `admin123`  
  (Created by `npx prisma db seed`.)
