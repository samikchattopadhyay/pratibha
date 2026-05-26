# Banner Template Management — Admin Guide

## Overview

The **Banner Template Management System** allows admins to upload and manage competition banner images without touching code. Instead of hardcoded banner URLs, admins can now:

- Upload banner images to cloud storage (Cloudflare R2)
- Create reusable banner templates with names, descriptions, and tags
- Select templates when creating competitions
- Fall back to custom URLs if needed

This guide walks you through the full workflow.

---

## Accessing Banner Templates

### Location
1. Log in to the admin dashboard: `https://yoursite.com/admin/dashboard`
2. Click the **⚙️ Settings** tab (at the top)
3. In the sidebar, click **🖼️ Banner Templates**

You should see:
- A grid of existing banner templates at the top
- An upload form below

---

## Part 1: Uploading a Banner Image

### Step 1: Select an Image File

1. Click **Choose File** in the upload form
2. Select a JPG, PNG, WebP, or GIF image (max 10 MB)
3. The image should be:
   - **Aspect ratio**: 16:9 (wide, like a banner)
   - **Resolution**: At least 800×450px for web quality
   - **File size**: Under 5 MB for best performance

### Step 2: Confirm Upload

- The image preview will appear in the form
- Click the upload button → the image uploads to cloud storage
- You'll see a success message when upload completes
- **Important**: This creates a cloud URL but does NOT yet create a template

### Step 3: Fill Template Details

After the image uploads successfully, fill in:

| Field | Required? | Example |
|-------|-----------|---------|
| **Template Name** | Yes | "General Festival 2026" |
| **Description** | Optional | "A vibrant festival banner for general competitions" |
| **Tags** | Optional | "festival, 2026, general" (comma-separated) |

### Step 4: Create Template

1. Click **Create Banner Template**
2. You'll see a success toast notification
3. The template now appears in the grid above

---

## Part 2: Managing Existing Templates

### View Templates

Templates appear as cards in the grid with:
- Image thumbnail (preview)
- Template name
- Tags (if any)
- Active status indicator

### What You Can Do

✅ **View details**: Hover over a template card to see the full image preview
✅ **Use in competitions**: Select templates when creating competitions (see Part 3)
❌ **Edit**: Not currently supported; create a new template instead
❌ **Delete**: Not currently supported; inactive templates are hidden

---

## Part 3: Using Templates When Creating Competitions

### Step 1: Start Creating a Competition

1. Go to the **Competitions** tab in the admin dashboard
2. Click **Create New Competition**
3. A modal dialog opens

### Step 2: Select or Upload a Banner

In the modal, you'll see two options:

#### Option A: Choose an Existing Template (Recommended)

1. Scroll down to **"Banner Template"**
2. You'll see a grid of template cards with thumbnails
3. Click any template card to select it
4. Selected template shows a **gold border and checkmark**
5. Continue with competition details

#### Option B: Use a Custom URL

1. Check **"Use Custom Banner URL"**
2. Paste a URL to any image (external link or R2 URL)
3. This bypasses template selection
4. Use this for one-time, non-reusable banners

### Step 3: Complete and Deploy

1. Fill in other competition details (name, category, etc.)
2. Click **Deploy Competition**
3. The competition is created with the selected banner image

---

## Best Practices

### Banner Image Guidelines

**Dimensions & Quality**
- Use 16:9 aspect ratio (ideal: 1600×900px, 800×450px minimum)
- Compress images before upload (keep under 5 MB)
- Use high-contrast images for readability

**Design**
- Include competition theme/category visual cues
- Avoid text overlays (title added by system)
- Test on mobile (banners scale down on small screens)
- Ensure good contrast if used with dark text overlay

**Naming Templates**
- Use descriptive names: `"Classical Singing Festival 2026"` (not `"banner1"`)
- Include year if time-sensitive: `"2026 Regional Qualifier"`
- Use category names if applicable: `"Drawing & Visual Arts"`

### When to Create Templates vs. Custom URLs

| Scenario | Use Template | Use Custom URL |
|----------|--------------|----------------|
| Reusable for multiple competitions | ✅ | ❌ |
| Used once, then forgotten | ❌ | ✅ |
| Part of brand identity | ✅ | ❌ |
| Temporary/experimental banner | ❌ | ✅ |
| Needs tagging/organization | ✅ | ❌ |

### Image Optimization Checklist

Before uploading:
- [ ] Aspect ratio is 16:9 (or close)
- [ ] File size under 5 MB
- [ ] Format is JPG, PNG, WebP, or GIF
- [ ] No visible compression artifacts
- [ ] Looks good at 800×450px (test zoom-out)
- [ ] Name is descriptive

---

## Workflow Examples

### Example 1: Setting Up Seasonal Templates

**Goal**: Create reusable templates for your annual competition cycle

1. **Upload Spring Festival banner** → Create template `"Spring Celebration 2026"`
2. **Upload Summer Gala banner** → Create template `"Summer Classics 2026"`
3. **Upload Autumn Recitation banner** → Create template `"Autumn Recitation 2026"`
4. **Upload Winter Gala banner** → Create template `"Winter Showcase 2026"`

Later, when creating competitions:
- Select the appropriate seasonal template from the grid
- No re-uploading needed

### Example 2: Category-Specific Templates

**Goal**: Match banners to competition categories

1. **Upload singing-themed image** → Create template `"Singing Competitions"`
2. **Upload dance-themed image** → Create template `"Dance Performances"`
3. **Upload drawing-themed image** → Create template `"Visual Arts & Drawing"`
4. **Upload recitation-themed image** → Create template `"Recitation & Literature"`

Then tag them:
- `singing` tag on singing template
- `dance` tag on dance template
- etc.

---

## Troubleshooting

### Upload Failed

**Error**: "File size exceeds 10MB limit"
- **Solution**: Compress the image using an online tool or image editor before uploading

**Error**: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed"
- **Solution**: Ensure the file is in one of the allowed formats; convert if needed

**Error**: "Upload appears frozen"
- **Solution**: Check internet connection; try uploading again

### Template Not Appearing in Grid

**Problem**: You created a template but don't see it in the grid
- **Solution**: Refresh the page (F5 or Cmd+R)
- Ensure you clicked "Create Banner Template" button (not just filled the form)

**Problem**: Only old templates showing, not newly created ones
- **Solution**: Hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### Banner Looks Wrong on Competition Page

**Problem**: Banner image is distorted or cut off
- **Solution**: Ensure image is 16:9 aspect ratio; use at least 800×450px

**Problem**: Banner isn't loading
- **Solution**: Wait a moment (cloud storage sync); try refreshing the competition page

---

## FAQ

**Q: Can I edit a template after creating it?**
A: Not yet. Create a new template instead. Unused templates will be hidden in future versions.

**Q: How many templates can I create?**
A: Unlimited. Organize with descriptive names and tags.

**Q: What if I want to use a banner that's already on the web?**
A: Use the "Custom Banner URL" option when creating a competition. Paste the external URL directly.

**Q: Will my uploaded images be secure?**
A: Yes. Images are stored on Cloudflare R2 (enterprise cloud storage) and only served via HTTPS.

**Q: Can I reorder templates in the grid?**
A: Not yet. They're sorted alphabetically by name. Use naming conventions (e.g., `"01 - Spring"`, `"02 - Summer"`) if you want a specific order.

**Q: What happens if I delete a competition? Is the template affected?**
A: No. Deleting a competition doesn't affect templates. Templates persist and can be reused.

---

## Tips for Success

1. **Name templates first, then upload**: Decide on names before uploading to avoid confusion
2. **Use tags liberally**: Tags help you find templates later (`2026`, `seasonal`, `category`, etc.)
3. **Test in preview**: After creating a competition with a template, check the public page to ensure the banner looks right
4. **Batch uploads**: If adding many templates, upload all images first, then create templates with descriptions
5. **Keep originals**: Save high-res versions of images locally before uploading (in case you need them later)

---

## What's Next?

After setting up templates, you can:
- Create competitions using template selection (much faster than copy/pasting URLs)
- Share template names with your team (`"Use the 'Classical Singing Festival' template for this competition"`)
- Retire old templates by removing them (future version feature)
- Batch-create competitions with consistent branding

For questions or feature requests, contact the technical team.
