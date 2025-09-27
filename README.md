# 🎨 AI Prompt Gallery

A production-ready, full-stack web application for browsing and managing AI image prompts. Features a modern, futuristic UI with secure admin panel and PostgreSQL database integration.

![AI Prompt Gallery](https://via.placeholder.com/800x400/667eea/ffffff?text=AI+Prompt+Gallery)

## ✨ Features

### 🎯 User Interface
- **Modern Design**: Futuristic, minimalistic interface matching the provided mockup
- **Gallery Grid**: Responsive card layout with images, categories, and prompt text
- **Category Filtering**: Filter prompts by All, Men, Women, Couple, Kids
- **One-Click Copy**: Copy prompts to clipboard with visual feedback
- **Live Updates**: Real-time prompt count and status indicators
- **Mobile Responsive**: Optimized for all screen sizes

### 🔐 Admin Panel
- **Secure Authentication**: Login-protected admin interface
- **CRUD Operations**: Add, edit, delete, and view all prompts
- **Rich Dashboard**: Statistics, recent activity, and management tools
- **Table Management**: Sortable, filterable table with thumbnails
- **Form Validation**: Client and server-side validation
- **Real-time Updates**: Auto-refresh functionality

### ⚡ Backend Features
- **PostgreSQL Database**: Robust, scalable data storage
- **RESTful API**: Clean, documented API endpoints
- **Security**: bcrypt password hashing, input validation, rate limiting
- **Error Handling**: Comprehensive error responses and logging
- **Environment Config**: Secure environment variable management

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-prompt-gallery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/ai_prompt_gallery
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-super-secret-jwt-key
   SESSION_SECRET=your-super-secret-session-key
   ```

4. **Setup PostgreSQL database**
   ```bash
   # Create database
   createdb ai_prompt_gallery
   
   # The app will automatically create tables on first run
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - **Gallery**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

## 🌐 Heroku Deployment

### Step 1: Prepare Your Repository

```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit: AI Prompt Gallery"
```

### Step 2: Create Heroku App

```bash
# Install Heroku CLI if not already installed
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app (replace 'your-app-name' with your desired name)
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:essential-0
```

### Step 3: Configure Environment Variables

```bash
# Set admin credentials
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your-secure-admin-password

# Set security secrets (generate random strings)
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)

# Set environment
heroku config:set NODE_ENV=production
```

### Step 4: Deploy to Heroku

```bash
# Deploy to Heroku
git push heroku main

# Open your app
heroku open
```

### Step 5: Verify Deployment

1. **Check logs** if there are issues:
   ```bash
   heroku logs --tail
   ```

2. **Access your application**:
   - Gallery: `https://your-app-name.herokuapp.com`
   - Admin: `https://your-app-name.herokuapp.com/admin`

3. **Database verification**:
   ```bash
   # Connect to database to verify tables
   heroku pg:psql
   \\dt
   ```

## 📁 Project Structure

```
ai-prompt-gallery/
├── public/                 # Frontend files
│   ├── index.html         # Main gallery page
│   ├── style.css          # Gallery styles
│   └── script.js          # Gallery functionality
├── admin/                 # Admin panel files
│   ├── admin.html         # Admin interface
│   ├── admin.css          # Admin styles
│   └── admin.js           # Admin functionality
├── routes/                # API routes
│   ├── prompts.js         # Prompt CRUD operations
│   └── auth.js            # Authentication routes
├── models/                # Database models
│   ├── Prompt.js          # Prompt model
│   └── AdminUser.js       # Admin user model
├── server.js              # Express server
├── db.js                  # Database configuration
├── package.json           # Dependencies and scripts
├── Procfile              # Heroku process file
├── .env.example          # Environment template
└── README.md             # This file
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /` - Gallery homepage
- `GET /api/prompts` - Get all prompts
- `GET /api/prompts?category=Men` - Get prompts by category
- `GET /health` - Health check

### Admin Endpoints (Authentication Required)
- `POST /api/login` - Admin login
- `POST /api/login/logout` - Admin logout
- `GET /api/auth/status` - Check auth status
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: HTML escaping and CSP headers
- **Password Security**: bcrypt hashing with salt rounds
- **Session Security**: Secure, HTTP-only session cookies
- **Environment Secrets**: Sensitive data in environment variables

## 🎨 Customization

### Adding New Categories
1. Update the category options in:
   - `admin/admin.html` (form selects)
   - `public/index.html` (filter buttons)
   - Update the frontend JavaScript to handle new categories

### Styling Modifications
- **Gallery**: Edit `public/style.css`
- **Admin Panel**: Edit `admin/admin.css`
- **Colors**: Update CSS custom properties for consistent theming

### Database Schema Changes
- Modify `db.js` initialization
- Update model files in `models/`
- Consider database migrations for production

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check DATABASE_URL
heroku config:get DATABASE_URL

# Verify database exists
heroku pg:info
```

**Admin Login Issues**
```bash
# Verify admin credentials
heroku config:get ADMIN_USERNAME
heroku config:get ADMIN_PASSWORD
```

**Build Failures**
```bash
# Check build logs
heroku logs --tail --dyno build

# Verify package.json scripts
npm run start  # Should work locally
```

**Frontend Not Loading**
- Verify static file serving in `server.js`
- Check browser console for JavaScript errors
- Ensure API endpoints are responding

### Production Debugging

```bash
# View application logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart dynos
heroku restart

# Run one-off commands
heroku run node -e "console.log('App is running')"
```

## 🚀 Performance Optimization

### Database
- Add indexes for frequently queried columns
- Implement connection pooling (already included)
- Consider caching for read-heavy operations

### Frontend
- Image lazy loading (partially implemented)
- CSS and JS minification for production
- CDN integration for static assets

### Backend
- Response compression
- API response caching
- Background job processing for heavy operations

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 3000 | Heroku sets this |
| `DATABASE_URL` | PostgreSQL connection URL | - | Yes |
| `ADMIN_USERNAME` | Admin login username | admin | Yes |
| `ADMIN_PASSWORD` | Admin login password | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `SESSION_SECRET` | Session encryption secret | - | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Heroku logs: `heroku logs --tail`
3. Verify environment variables: `heroku config`
4. Check database connection: `heroku pg:info`

## 🌟 Features in Detail

### Gallery Interface
- **Responsive Grid**: Automatically adapts to screen size
- **Image Optimization**: Lazy loading and error handling
- **Copy Functionality**: Clipboard API with fallback
- **Filter Animation**: Smooth transitions between categories
- **Live Statistics**: Real-time prompt counting
- **Toast Notifications**: User feedback for actions

### Admin Dashboard
- **Statistics Dashboard**: Overview of prompts and activity
- **Table Management**: Sortable, filterable data table
- **Modal Forms**: Inline editing without page refreshes
- **Image Preview**: Thumbnail display in management table
- **Bulk Operations**: Future-ready for batch actions
- **Auto-refresh**: Keeps data current automatically

### Backend Architecture
- **MVC Pattern**: Organized model-view-controller structure
- **Error Handling**: Comprehensive error responses
- **Logging**: Structured logging for debugging
- **Security Headers**: Helmet.js for security headers
- **Rate Limiting**: Configurable request throttling
- **Database Pooling**: Efficient connection management

---

**🚀 Your AI Prompt Gallery is ready for production!**

Access your live application:
- **Gallery**: `https://your-app-name.herokuapp.com`
- **Admin Panel**: `https://your-app-name.herokuapp.com/admin`