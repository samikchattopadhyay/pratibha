# Facebook OAuth Setup Guide for Pratibha Parishad

**Last Updated**: 2026-05-28  
**Purpose**: Enable Facebook OAuth registration flow  
**Estimated Time**: 15-20 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create a Meta Developer Account](#step-1-create-a-meta-developer-account)
3. [Step 2: Create a Facebook App](#step-2-create-a-facebook-app)
4. [Step 3: Configure Facebook Login](#step-3-configure-facebook-login)
5. [Step 4: Get App ID and App Secret](#step-4-get-app-id-and-app-secret)
6. [Step 5: Configure OAuth Redirect URI](#step-5-configure-oauth-redirect-uri)
7. [Step 6: Add Credentials to .env](#step-6-add-credentials-to-env)
8. [Step 7: Test the Integration](#step-7-test-the-integration)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, ensure you have:

- ✅ A **Meta/Facebook account** (personal account, not a business account)
- ✅ **Admin access** to the Facebook account
- ✅ Your **local development environment** running (or know your production domain)
- ✅ A **text editor** to edit the `.env` file
- ✅ Access to **https://developers.facebook.com**

---

## Step 1: Create a Meta Developer Account

### 1.1 Go to Meta for Developers

1. Open your browser and navigate to **https://developers.facebook.com**
2. Look for the **Get Started** or **Sign Up** button in the top-right corner
3. Click it to begin the registration process

### 1.2 Sign In or Create Account

- **If you have a Meta account**: Click **Log In** and use your Facebook/Meta credentials
- **If you don't have an account**: Click **Create Meta Account**
  - Enter your **email address**
  - Create a **strong password**
  - Verify your email address via the confirmation link sent to your inbox
  - Complete your profile information

### 1.3 Verify Your Identity

Meta may ask you to verify your identity:
- Enter a **valid phone number** (used for account recovery)
- Confirm via **text message (SMS)** or **email**
- Provide additional details if prompted

Once verified, you'll have access to the Meta Developers dashboard.

---

## Step 2: Create a Facebook App

### 2.1 Navigate to the App Dashboard

1. After logging in, you'll see the **Meta Developers** home page
2. In the top menu, click **My Apps** (or go directly to **https://developers.facebook.com/apps**)
3. You should see an empty list or existing apps

### 2.2 Create a New App

1. Click the **Create App** button (usually a blue button in the top-right)
2. A modal dialog will appear asking for app details

### 2.3 Fill in App Information

**App Name:**
- Enter: `Pratibha Parishad` (or `Pratibha Parishad Dev` for development)
- This is the name that will appear in the Facebook login dialog to users

**App Contact Email:**
- Enter your email: `samikchattopadhyay@gmail.com`
- This is where Meta sends important notifications

**App Purpose:**
- Select: **Consumer** (since you're building a user-facing app)
- Or **Business** if you're creating a business-facing app

**App Type:**
- Look for a dropdown or question about what you're building
- Select: **Web** or **Website**
- Meta may ask for clarification—choose the option closest to "social login/authentication"

### 2.4 Complete App Setup

1. Click **Create App** (or **Next** if there are multiple steps)
2. Meta will show you the app dashboard
3. You'll see:
   - App ID (a long number, e.g., `1234567890123456`)
   - App Secret (a random string, e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5`)
   - Other settings and products

**Keep this tab open** — you'll need the App ID and App Secret in Step 4.

---

## Step 3: Configure Facebook Login

### 3.1 Add the Login Product

1. In the app dashboard, look for **Add Product** or **Products** in the left sidebar
2. Search for and click **Facebook Login**
3. Click **Set Up** (or **Add** if not yet added)

### 3.2 Choose Your Platform

A dialog will ask: *"Which platform is your app for?"*

- **Select**: **Web** (since Pratibha is a Next.js web app)
- Click **Next** or **Continue**

### 3.3 Configure Settings

Meta will show a setup wizard with steps like:

1. **Create your Facebook app** — Already done ✅
2. **Download and integrate the SDK** — Skip or ignore (we're using NextAuth.js, not the SDK)
3. **Configure your app** — This is important; continue to Step 4

---

## Step 4: Get App ID and App Secret

### 4.1 Find Your App ID

1. In the app dashboard, go to **Settings** → **Basic** (left sidebar)
2. You'll see your **App ID** at the top
   - It looks like a long number: `1234567890123456`
   - Click the **Copy** icon next to it to copy to clipboard

### 4.2 Find Your App Secret

1. Still in **Settings** → **Basic**
2. Look for **App Secret** (below App ID)
3. Click **Show** (it's hidden for security)
4. You may need to **re-enter your password** to reveal it
5. Once revealed, click **Copy** to copy to clipboard

### 4.3 Save Temporarily

⚠️ **IMPORTANT**: Store these temporarily in a **safe location** (e.g., a text file) because:
- The **App Secret** is sensitive — only you should have access
- You'll need both values in Step 6

---

## Step 5: Configure OAuth Redirect URI

### 5.1 Navigate to Facebook Login Settings

1. In the app dashboard, go to **Products** → **Facebook Login**
2. On the left sidebar, click **Settings** (under Facebook Login)

### 5.2 Add Valid OAuth Redirect URIs

You'll see a field labeled **Valid OAuth Redirect URIs**.

**For Development (localhost):**
```
http://localhost:3000/api/auth/callback/facebook
```

**For Production:**
```
https://yourdomain.com/api/auth/callback/facebook
```

(Replace `yourdomain.com` with your actual domain)

### 5.3 Save the Settings

1. **Add the development URI** (copy-paste the localhost URI above)
2. Click **Save Changes** or **Add**
3. You should see a success message

### 5.4 Configure App Domains (Important)

1. Scroll up in the same **Settings** page
2. Look for **App Domains** field
3. Add your development domain:
   - **For development**: `localhost`
   - **For production**: `yourdomain.com` (without http://)

### 5.5 Configure Site URL (if prompted)

Some setups may ask for **Site URL**:
- **For development**: `http://localhost:3000`
- **For production**: `https://yourdomain.com`

Save all changes.

---

## Step 6: Add Credentials to .env

### 6.1 Open the `.env` File

Navigate to your project root:

```bash
c:\Development\pratibha\.env
```

Open it with your text editor (VS Code, Notepad++, etc.).

### 6.2 Add Facebook Credentials

Find the section with other environment variables and add:

```env
# ────────────────────────────────────────────
# Facebook OAuth Configuration
# ────────────────────────────────────────────
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

### 6.3 Replace Placeholders

**Replace** `your_app_id_here` and `your_app_secret_here` with the actual values from Step 4:

**Example:**
```env
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 6.4 Save the File

- **Press `Ctrl+S`** (or `Cmd+S` on Mac) to save
- You'll see a visual indicator that the file is saved

### 6.5 Restart Your Development Server

The development server needs to **reload the environment variables**:

1. **Stop the server**: Press `Ctrl+C` in your terminal
2. **Restart the server**: Run
   ```bash
   npm run dev
   ```
3. You should see:
   ```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Environments: .env
   ```

**The `.env` file is now loaded with your Facebook credentials** ✅

---

## Step 7: Test the Integration

### 7.1 Start the Dev Server

If not already running:

```bash
npm run dev
```

Wait for the message: `ready - started server on 0.0.0.0:3000`

### 7.2 Visit Registration Page

1. Open **http://localhost:3000/register** in your browser
2. You should see the **Continue with Facebook** button at the top

### 7.3 Click the Facebook Button

1. Click **Continue with Facebook**
2. You'll be redirected to Facebook's login page
3. **Sign in with your Facebook account** (use a test account if you prefer)
4. Facebook will ask for permission to:
   - Access your name
   - Access your email
   - Access your profile picture

5. Click **Continue** or **Allow**

### 7.4 Complete the Setup Flow

After authentication, you should be redirected to the **password setup** page:
- URL: `http://localhost:3000/auth/setup/set-password?token=...`
- This confirms the OAuth flow is working ✅

### 7.5 Troubleshoot if Needed

If you see an error, check:
- ✅ Credentials are correct in `.env`
- ✅ Dev server was restarted after adding `.env` variables
- ✅ Redirect URI matches exactly: `http://localhost:3000/api/auth/callback/facebook`
- ✅ App is in **Development** mode (not Live)

See [Troubleshooting](#troubleshooting) below for more help.

---

## Troubleshooting

### Error: "Invalid OAuth Redirect URI"

**Cause**: The redirect URI in Meta doesn't match your app's callback URL.

**Solution**:
1. Go to **Facebook App Settings** → **Facebook Login** → **Settings**
2. Verify the **Valid OAuth Redirect URIs** includes:
   ```
   http://localhost:3000/api/auth/callback/facebook
   ```
3. Make sure there are **no extra spaces** or typos
4. If changed, save and restart your dev server

### Error: "App Not Set Up"

**Cause**: Facebook Login product wasn't properly configured.

**Solution**:
1. Go to **App Dashboard** → **Products**
2. Find **Facebook Login**
3. If not listed, click **Add Product** → search **Facebook Login** → click **Set Up**
4. Complete the setup wizard
5. Restart dev server

### Error: "This App Isn't Set Up for This URL"

**Cause**: App domain or site URL doesn't match your development URL.

**Solution**:
1. Go to **Settings** → **Basic**
2. Under **App Domains**, add: `localhost`
3. Under **Site URL**, add: `http://localhost:3000`
4. Save changes and restart dev server

### Error: "Invalid App ID or App Secret"

**Cause**: Credentials in `.env` are incorrect or malformed.

**Solution**:
1. Double-check your `.env` file for typos
2. Go to **Settings** → **Basic** and re-copy the App ID and App Secret
3. Paste them again into `.env`
4. Save `.env` and restart dev server

### Facebook Button Doesn't Appear

**Cause**: Frontend component issue or styling problem.

**Solution**:
1. Check browser console (F12 → Console tab) for JavaScript errors
2. Verify `src/components/auth/FacebookLoginButton.tsx` exists
3. Verify it's imported in `src/app/register/page.tsx` (line 10)
4. Check that the button renders with `<FacebookLoginButton />`

### Cannot See Callback Token

**Cause**: Setup flow redirect may not be working.

**Solution**:
1. Check browser console for JavaScript errors (F12)
2. Check server console for error logs
3. Verify the NextAuth setup in `src/lib/auth.ts` includes FacebookProvider
4. Ensure database migrations have been run: `npx prisma migrate dev`

---

## Going to Production

When deploying to production:

### 1. Add Production Redirect URI

In **Facebook App** → **Settings** → **Facebook Login** → **Settings**:
```
https://yourdomain.com/api/auth/callback/facebook
```

### 2. Add Production App Domains

In **Settings** → **Basic**:
- **App Domains**: `yourdomain.com`
- **Site URL**: `https://yourdomain.com`

### 3. Update `.env` for Production

On your production server, set:
```env
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
NEXTAUTH_URL=https://yourdomain.com
```

### 4. Switch App to Live

In the app dashboard, change the app mode from **Development** to **Live**:
1. Click the **Development** toggle at top-left
2. Select **Switch to Live Mode**
3. Confirm the action

---

## Security Best Practices

✅ **DO:**
- Store `FACEBOOK_APP_SECRET` in environment variables only
- Never commit `.env` files to Git
- Use different App IDs for development and production
- Regularly rotate your App Secret

❌ **DON'T:**
- Share your App Secret publicly
- Hardcode credentials in source code
- Commit `.env` files to version control
- Use production App ID for testing

---

## Reference

### NextAuth.js Documentation
- [Next Auth Facebook Provider](https://next-auth.js.org/providers/facebook)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/example)

### Facebook Developer Docs
- [Facebook App Setup](https://developers.facebook.com/docs/development/create-an-app/)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [OAuth 2.0 Spec](https://datatracker.ietf.org/doc/html/rfc6749)

### Pratibha Implementation
- [Facebook OAuth Plan](../plans/facebook-oauth-registration-plan.md)
- [Auth Configuration](../../src/lib/auth.ts)
- [Facebook Login Button](../../src/components/auth/FacebookLoginButton.tsx)

---

## Support & Questions

If you encounter issues:

1. **Check this guide** for the specific error in [Troubleshooting](#troubleshooting)
2. **Review the implementation files**:
   - `src/lib/auth.ts` (NextAuth configuration)
   - `src/components/auth/FacebookLoginButton.tsx` (Frontend button)
   - `.env` (Credentials)
3. **Check browser console** (F12) for JavaScript errors
4. **Check server logs** for backend errors
5. **Review Meta's developer docs** for Facebook-specific issues

---

## Checklist

Use this checklist to verify all steps are complete:

- [ ] Meta Developer Account created
- [ ] Facebook App created with name "Pratibha Parishad"
- [ ] Facebook Login product added
- [ ] App ID copied from Settings → Basic
- [ ] App Secret copied from Settings → Basic
- [ ] Valid OAuth Redirect URI added: `http://localhost:3000/api/auth/callback/facebook`
- [ ] App Domains set to: `localhost`
- [ ] Site URL set to: `http://localhost:3000`
- [ ] `FACEBOOK_APP_ID` added to `.env`
- [ ] `FACEBOOK_APP_SECRET` added to `.env`
- [ ] Dev server restarted (`npm run dev`)
- [ ] Registration page loads at `http://localhost:3000/register`
- [ ] "Continue with Facebook" button is visible
- [ ] Clicking button redirects to Facebook login
- [ ] Setup flow loads after authentication
- [ ] No errors in browser console (F12)
- [ ] No errors in server console

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-28 | Claude Code | Initial comprehensive guide |

