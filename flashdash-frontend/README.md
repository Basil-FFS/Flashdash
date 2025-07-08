# FlashDash Frontend

A React-based dashboard application for Flash Funding Solutions.

## Features

- **User Authentication**: Secure login system with role-based access
- **Dashboard**: Agent details and performance metrics
- **Credit Report Lookup**: Search and view client debt information
- **Admin Panel**: User management for administrators
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint:
   - Create a `.env` file in the root directory
   - Add your API Gateway URL:
   ```
   REACT_APP_API_BASE=https://your-api-gateway-url.com/dev
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Configuration

The application uses a centralized API configuration system located in `src/config.js`.

### Available Endpoints

- `POST /login` - User authentication
- `GET /me` - Get current user information
- `GET /admin/users` - Get all users (admin only)
- `POST /admin/users` - Create new user (admin only)
- `PUT /admin/users/:id` - Update user (admin only)
- `DELETE /admin/users/:id` - Delete user (admin only)
- `POST /forthcrm/credit-report` - Fetch credit report data

### Environment Variables

- `REACT_APP_API_BASE`: Base URL for the API Gateway
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

### 404 Errors

If you're getting 404 errors when accessing API endpoints:

1. **Check API Gateway URL**: Verify the URL in your `.env` file or `src/config.js`
2. **Verify Endpoints**: Ensure all required endpoints are configured in your backend
3. **Check CORS**: Make sure your API Gateway allows requests from your frontend domain

### Common Issues

1. **Login Fails**: 
   - Check if the `/login` endpoint exists in your backend
   - Verify the API Gateway URL is correct
   - Check browser console for detailed error messages

2. **Credit Report Not Loading**:
   - Ensure the `/forthcrm/credit-report` endpoint is configured
   - Check that the contact ID format is correct
   - Verify authentication token is valid

3. **Admin Panel Access Denied**:
   - Ensure user has "admin" role
   - Check if admin endpoints are properly configured
   - Verify token permissions

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.js        # Login form
│   ├── Dashboard.js    # Main dashboard
│   ├── AdminPanel.js   # User management
│   └── Sidebar.js      # Navigation sidebar
├── pages/              # Page components
│   ├── Home.js         # Home page (unused)
│   └── Filters.js      # Filters page (unused)
├── utils/              # Utility functions
│   └── api.js          # API functions
├── config.js           # API configuration
└── App.js              # Main application component
```

## Development

### Adding New API Endpoints

1. Add the endpoint to `src/config.js`:
   ```javascript
   export const API_ENDPOINTS = {
     // ... existing endpoints
     NEW_ENDPOINT: "/new-endpoint"
   };
   ```

2. Create the API function in `src/utils/api.js`:
   ```javascript
   export async function newApiFunction(data, token) {
     // Implementation
   }
   ```

### Styling

The application uses Tailwind CSS for styling. The main color scheme is:
- Primary: `#004845` (dark green)
- Secondary: `#00332e` (darker green)
- Accent: White with opacity for overlays

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

3. Update the `REACT_APP_API_BASE` environment variable for production

## Support

For issues related to:
- **Frontend**: Check this README and browser console
- **Backend**: Contact your backend development team
- **API Gateway**: Check AWS API Gateway console and CloudWatch logs 