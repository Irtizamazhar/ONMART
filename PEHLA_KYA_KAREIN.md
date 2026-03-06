Here is your **complete guide translated into simple English** while keeping the same step-by-step structure.

---

# What to do first? – Step by step (easy)

Just follow **one step at a time**. Complete one step, then move to the next.

---

# Step 1 – Open MySQL

1. Open **Windows Search** (from the taskbar).
2. Type: **MySQL 8.0 Command Line Client**
3. Click on that app.
4. A **black window** will open. Enter your **MySQL password** (the password you set when installing MySQL).

   * If you didn’t set a password, just press **Enter**.

**Note:** Nothing will appear while typing the password. This is normal because passwords are hidden.

---

# Step 2 – Create the database

In the same window that opened in Step 1, type this line:

```
CREATE DATABASE onmart;
```

Press **Enter**.

If no error appears, the **database has been created successfully**.

Then exit by typing:

```
exit
```

Press **Enter** and the MySQL window will close.

---

# Step 3 – Open the project folder and open Terminal (detailed)

**Meaning of Step 3:**
In **Cursor or VS Code**, you need to open the **onmart project folder** and open the **Terminal** inside it.

The **Terminal** is where you type commands like:

* `npx prisma generate`
* `npm run dev`

---

## Step 3.1 – Open the project folder

1. Open **Cursor** or **VS Code**.
2. Click **File** → **Open Folder**.
3. Select:

```
Desktop → New folder (9) → onmart
```

(You should see files like `package.json`, `src`, and `prisma` inside it.)

4. Click **Select Folder / Open**.

Now on the **left side (Explorer)** you should see the **onmart** project with files like:

* package.json
* src
* prisma

This means the **correct project folder is open**.

---

## Step 3.2 – Open Terminal

**Terminal** is a panel (usually black) where you type commands.

There are **3 ways to open it**:

### Method A – Shortcut (easiest)

Press:

```
Ctrl + `
```

(The backtick key ` is below **Esc** and left of **1**.)

A terminal panel will open at the **bottom**.

---

### Method B – From menu

Click:

```
Terminal → New Terminal
```

The terminal panel will open.

---

### Method C – Command palette

Press:

```
Ctrl + Shift + P
```

Then type:

```
Terminal: Create New Terminal
```

Press **Enter**.

---

## Step 3.3 – Confirm terminal is in the correct folder

Inside the terminal, type:

```
cd
```

Press **Enter**.

You should see a path like:

```
C:\...\onmart
```

If **onmart** appears in the path, you are in the correct folder.

✅ Step 3 is now complete.

---

# Step 4 – Create the `.env` file

**Why:**
The app needs **database credentials** (password and database name) to connect with MySQL.

These are stored in a **.env file**.

---

### What to do

1. In the **Explorer (left side)** go to the **onmart root folder**.
2. Look for a file named:

```
.env
```

* If it exists → open it.
* If not → right-click the root folder → **New File** → name it:

```
.env
```

3. Inside the `.env` file write:

```
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/onmart"
```

Replace **YOUR_PASSWORD** with your MySQL password.

Example if password is empty:

```
DATABASE_URL="mysql://root:@localhost:3306/onmart"
```

4. Press:

```
Ctrl + S
```

to save the file.

---

# Step 5 – Create tables in MySQL using Prisma

**Why:**
Your app needs database tables like:

* User
* Product
* Order
* Category
* Banner

Prisma will create them automatically.

---

### Run these commands in Terminal

Run **one command at a time**.

First command:

```
npx prisma generate
```

Press **Enter**.

Wait until you see something like:

```
Generated Prisma Client
```

Then run the second command:

```
npx prisma db push
```

Press **Enter**.

This will create all tables inside the **onmart database**.

You may see:

```
Your database is now in sync
```

---

# Step 6 – Create the admin user (seed)

**Why:**
You need an **admin account** to access the **/admin panel**.

Run this command in the same terminal:

```
npx prisma db seed
```

Press **Enter**.

If no error appears, the **admin user is created**.

### Admin login details

Email:

```
admin@onmart.com
```

Password:

```
admin123
```

Use this later to log in to **/admin**.

---

# Step 7 – Run the application

In the terminal run:

```
npm run dev
```

Press **Enter**.

After a few seconds you will see something like:

```
Ready on http://localhost:3000
```

or

```
Local: http://localhost:3000
```

---

### Open the website

Open **Chrome or Edge** and go to:

```
http://localhost:3000
```

---

### Now you can use the app

**User side**

* Sign up
* Login
* Data will be stored in MySQL

**Admin side**

Open:

```
http://localhost:3000/admin
```

Login using:

Email:

```
admin@onmart.com
```

Password:

```
admin123
```

---

### Stop the app

In the terminal press:

```
Ctrl + C
```

---

# Short summary (to remember the order)

| Step | What to do                                                                    |
| ---- | ----------------------------------------------------------------------------- |
| 1    | Open MySQL Command Line Client                                                |
| 2    | Run `CREATE DATABASE onmart;` then `exit`                                     |
| 3    | Open **onmart** folder in Cursor / VS Code and open Terminal                  |
| 4    | Create `.env` file and add `DATABASE_URL`                                     |
| 5    | Run `npx prisma generate` then `npx prisma db push`                           |
| 6    | Run `npx prisma db seed` (creates admin user)                                 |
| 7    | Run `npm run dev` and open **[http://localhost:3000](http://localhost:3000)** |

---


