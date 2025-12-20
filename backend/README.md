## College Leave Management – FastAPI Backend

This is a simple backend API for managing **college leave letters and approvals** built with **FastAPI** and **PostgreSQL**.

### Main Features

- **User management**: create users (students, faculty, admin) with hashed passwords.
- **Authentication**: basic email/password login (returns a placeholder token you can later replace with real JWT).
- **Leave requests**:
  - Create a leave request (with type, dates, reason, subject).
  - List / filter leave requests.
  - View a single leave request.
  - Update status (pending/approved/rejected) with approver.
- **Letter generation**:
  - Generates a text leave letter using templates in the `templates` folder
  - Supports: `emergency`, `medical`, `personal`, `wedding` templates.

---

### 1. Setup Python environment

```bash
cd leave
python -m venv myenv
myenv\Scripts\activate  # on Windows
pip install -r requirements.txt
```

### 2. Configure PostgreSQL

Create a database, for example:

```sql
CREATE DATABASE leave_db;
```

Then set the `DATABASE_URL` environment variable (PowerShell example):

```powershell
$env:DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/leave_db"
```

If you don't set it, the app will default to:

```text
postgresql+psycopg2://postgres:postgres@localhost:5432/leave_db
```

Update the credentials to match your local Postgres setup.

### 3. Run the API

From the project root:

```bash
uvicorn app.main:app --reload
```

The interactive docs will be available at:

- Swagger UI: `http://127.0.0.1:8000/docs`

### 4. Example workflow (basic)

1. **Create a user (student)**  
   `POST /users/`
   ```json
   {
     "name": "Alice",
     "email": "alice@example.com",
     "password": "secret123",
     "role": "student"
   }
   ```

2. **Login**  
   `POST /auth/login`
   ```json
   {
     "email": "alice@example.com",
     "password": "secret123"
   }
   ```

3. **Create a leave request**  
   `POST /leaves/`
   ```json
   {
     "student_id": 1,
     "leave_type": "medical",
     "subject": "Medical leave request",
     "reason": "High fever and doctor appointment",
     "from_date": "2025-01-10",
     "to_date": "2025-01-12"
   }
   ```

4. **List leave requests**  
   `GET /leaves/`

5. **Approve / reject a leave**  
   `PUT /leaves/{leave_id}/status`
   ```json
   {
     "status": "approved",
     "approver_id": 2
   }
   ```

6. **Get generated letter text**  
   `GET /leaves/{leave_id}/letter`

You can now build your frontend (web or mobile) on top of these APIs.


