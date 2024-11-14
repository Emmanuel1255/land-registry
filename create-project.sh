#!/bin/bash

# Create root directory
mkdir -p src

# Create main directories
cd src
directories=(
    "assets/icons"
    "assets/images"
    "components/common"
    "components/layout"
    "components/auth"
    "components/dashboard"
    "components/land"
    "components/maps"
    "config"
    "context"
    "hooks"
    "pages/auth"
    "pages/dashboard"
    "pages/land"
    "pages/admin"
    "services"
    "store/slices"
    "styles"
    "utils"
)

# Create directories
for dir in "${directories[@]}"; do
    mkdir -p "$dir"
done

# Create component files
touch components/common/{Button,Input,Alert,Modal,Spinner,Card}.jsx
touch components/layout/{Navbar,Sidebar,Footer,DashboardLayout}.jsx
touch components/auth/{LoginForm,RegisterForm,ForgotPassword}.jsx
touch components/dashboard/{Statistics,RecentActivity,StatusCards}.jsx
touch components/land/{RegistrationForm,PropertyList,PropertyDetails,TransferForm,DocumentUpload}.jsx
touch components/maps/{PropertyMap,BoundaryViewer}.jsx

# Create config files
touch config/{axios,constants}.js

# Create context files
touch context/AuthContext.jsx

# Create hooks files
touch hooks/{useAuth,useProperty,useDocuments}.js

# Create pages files
touch pages/auth/{Login,Register,ForgotPassword}.jsx
touch pages/dashboard/{Dashboard,Profile,Settings}.jsx
touch pages/land/{Registration,Transfer,Search,Verification}.jsx
touch pages/admin/{UserManagement,SystemLogs,Settings}.jsx

# Create services files
touch services/{api,auth.service,property.service,document.service}.js

# Create store files
touch store/slices/{authSlice,propertySlice,documentSlice}.js
touch store/store.js

# Create styles file
touch styles/index.css

# Create utils files
touch utils/{validation,formatters,helpers}.js

# Create root files
touch {App,main}.jsx
touch vite.config.js

echo "Project structure created successfully!"

# Print the directory tree
if command -v tree > /dev/null; then
    tree ..
else
    echo "Note: Install 'tree' command to view the directory structure"
fi