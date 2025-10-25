# Project Setup Guide

## Frontend Setup

### Installation

1. **Install dependencies:**
   ```sh
   bun i
   # or
   npm install
   ```

2. **Configure environment:**
   ```sh
   cp .env.example .env
   ```

3. **Start development server:**
   ```sh
   bun run dev
   ```

---

## Backend Setup

### Prerequisites
- Docker Desktop installed and running
- Composer installed

### Installation

1. **Install Composer dependencies:**
   ```sh
   composer install
   ```

2. **Configure environment:**
   ```sh
   cp .env.example .env
   ```

3. **Set up Sail alias:**

   **macOS/Linux:**
   ```sh
   echo "alias sail='sh \$([ -f sail ] && echo sail || echo vendor/bin/sail)'" >> ~/.zshrc
   source ~/.zshrc
   ```

   **Windows (PowerShell):**
   ```powershell
   notepad $PROFILE
   ```
   
   Add this function to the file:
   ```powershell
   function sail {
       if (Test-Path "sail") {
           sh sail @args
       } else {
           sh vendor/bin/sail @args
       }
   }
   ```
   
   Save and reload:
   ```powershell
   . $PROFILE
   ```

4. **Start Docker containers:**
   ```sh
   sail up -d --build
   ```

5. **Run database migrations:**
   ```sh
   sail artisan migrate:fresh
   ```

6. **Seed the database:**
   ```sh
   sail artisan db:seed
   ```

7. **Link storage directory:**
   ```sh
   sail artisan storage:link
   ```

### Stopping the Application

```sh
sail down -v
```

---

## WebSockets

Start the WebSocket server:

```sh
bun run dev
```

---

## Database Access

Access the database management interface at: [http://localhost:8080/api](http://localhost:8080/api)

**Credentials:**
- **Username:** sail
- **Password:** password
- **Database:** laravel

---

## Troubleshooting

<details>
<summary><strong>Laravel Sail Permission Issues</strong></summary>

If you encounter permission errors when running Artisan commands (e.g., "There is no existing directory at storage/logs and it could not be created"), follow these steps:

### Step 1: Create Required Directories

```sh
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/app/public
```

### Step 2: Set Permissions on Host

```sh
sudo chmod -R 777 storage bootstrap/cache
```

### Step 3: Fix Permissions Inside Docker Container

**Primary method:**
```sh
sail root-shell -c "chown -R sail:sail /var/www/html/storage /var/www/html/bootstrap/cache && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache"
```

**Alternative method:**
```sh
docker exec -u root laravel-laravel.test-1 chown -R sail:sail /var/www/html/storage
docker exec -u root laravel-laravel.test-1 chmod -R 775 /var/www/html/storage
```

### Step 4: Clear Cache

```sh
sail artisan config:clear
sail artisan cache:clear
```

### Step 5: Restart Sail (if needed)

```sh
sail down
sail up -d
```

### Why This Happens

When using Laravel Sail, commands run inside the Docker container, not on your host machine. The container uses a different user (`sail`) with different permissions, so host-level permission changes don't affect it. You must set permissions inside the container for Laravel to write to storage directories.

</details>

---

## Useful Commands

### macOS/Linux

**Check if a port is in use:**
```sh
lsof -i :PORT_NUMBER
# Example: lsof -i :3000
```

**Kill a process on a specific port:**
```sh
kill -9 $(lsof -ti :PORT_NUMBER)
# Example: kill -9 $(lsof -ti :3000)
```

### Common Artisan Commands

```sh
# Run migrations
sail artisan migrate

# Fresh migration (drops all tables)
sail artisan migrate:fresh

# Run seeders
sail artisan db:seed

# Clear caches
sail artisan config:clear
sail artisan cache:clear
sail artisan route:clear
sail artisan view:clear

# Create storage link
sail artisan storage:link
```

---

## Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sail Documentation](https://laravel.com/docs/sail)
- [Bun Documentation](https://bun.sh/docs)