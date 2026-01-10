# Firebase Migration Plan (Revised)

## 1. Setup & Preparation
- [x] Create migration plan
- [ ] Create Firebase Project
- [ ] Enable **Realtime Database** (NOT Firestore)
- [ ] (Optional) Enable **Authentication** (Anonymous only - for security rules)
- [ ] Get Firebase Configuration

## 2. Project Configuration
- [x] Create `firebase.json`
- [ ] Create `.firebaserc`

## 3. Code Refactoring (`index_firebase.html`)
- [x] Replace PocketBase SDK with Firebase SDKs (Realtime Database)
- [x] Remove Cloud Storage dependencies (No images)
- [x] **Authentication**: (Prepared for config integration)
- [x] **Profile System**:
  - [x] Remove image upload
  - [x] Implement Emoji Picker (10 presets)
- [x] **Database (Realtime Database)**:
  - [x] Message sync (`ref('messages').limitToLast(100).on(...)`)
  - [x] Member presence (`onDisconnect().remove()` is perfect for this)
  - [x] Chat rooms

## 4. Deployment
- [ ] `firebase deploy`
