/**
 * Study Arena - Authentication Engine
 * Pure Client-Side Authentication with Google Identity Services (GIS),
 * Persistent Browser Sessions, Registered Accounts, and Demo Guest Mode.
 * 100% Pure ASCII.
 */
(function(window) {
  'use strict';

  var STORAGE_KEY = 'sa_auth_user_v1';
  var CLIENT_ID_KEY = 'sa_google_client_id';
  var DEFAULT_CLIENT_ID = '473457918792-rs6lb669qkstj4ed717vro61mp930ita.apps.googleusercontent.com';
  var USERS_DB_KEY = 'sa_registered_users_v1';
  var listeners = [];

  function getStoredUsers() {
    try {
      var raw = localStorage.getItem(USERS_DB_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (typeof parsed === 'object' && parsed !== null) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveStoredUsers(db) {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('[Auth] Failed to save users database:', e);
    }
  }

  var Auth = {
    getUser: function() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    isLoggedIn: function() {
      return this.getUser() !== null;
    },

    setUser: function(user) {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      this.notifyListeners(user);
    },

    getGoogleClientId: function() {
      try {
        var custom = (localStorage.getItem(CLIENT_ID_KEY) || '').trim();
        return custom || DEFAULT_CLIENT_ID;
      } catch (e) {
        return DEFAULT_CLIENT_ID;
      }
    },

    setGoogleClientId: function(id) {
      try {
        if (id && id.trim()) {
          localStorage.setItem(CLIENT_ID_KEY, id.trim());
        } else {
          localStorage.removeItem(CLIENT_ID_KEY);
        }
      } catch (e) {
        console.warn('[Auth] Failed to store client ID:', e);
      }
    },

    onAuthStateChanged: function(callback) {
      if (typeof callback === 'function') {
        listeners.push(callback);
        try {
          callback(this.getUser());
        } catch (e) {
          console.error('[Auth] Initial auth state callback error:', e);
        }
      }
    },

    notifyListeners: function(user) {
      for (var i = 0; i < listeners.length; i++) {
        try {
          listeners[i](user);
        } catch (e) {
          console.error('[Auth] Listener callback error:', e);
        }
      }
    },

    // Sign in with Google Identity Services (GIS)
    signInWithGoogle: function() {
      var self = this;
      return new Promise(function(resolve, reject) {
        var clientId = self.getGoogleClientId();

        // If no Client ID configured, ask the UI to prompt for Client ID or Real Google Profile
        if (!clientId) {
          var err = new Error('No Google Client ID configured.');
          err.code = 'NO_CLIENT_ID';
          return reject(err);
        }

        // Verify GIS client library is loaded
        if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
          var loadErr = new Error('Google Identity Services library is not loaded. Please check your internet connection or use direct sign-in.');
          loadErr.code = 'GIS_NOT_LOADED';
          return reject(loadErr);
        }

        try {
          var client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
            callback: function(tokenResponse) {
              if (tokenResponse.error) {
                return reject(new Error(tokenResponse.error_description || tokenResponse.error));
              }
              if (!tokenResponse.access_token) {
                return reject(new Error('No access token returned by Google Identity Services.'));
              }

              // Fetch verified Google User Profile
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  'Authorization': 'Bearer ' + tokenResponse.access_token
                }
              })
              .then(function(res) {
                if (!res.ok) throw new Error('Failed to retrieve user profile from Google API.');
                return res.json();
              })
              .then(function(info) {
                var user = {
                  uid: 'google_' + (info.sub || Math.random().toString(36).substring(2, 10)),
                  displayName: info.name || info.email.split('@')[0],
                  email: info.email,
                  photoURL: info.picture || '',
                  provider: 'google',
                  createdAt: new Date().toISOString()
                };
                self.setUser(user);
                resolve(user);
              })
              .catch(function(fetchErr) {
                reject(fetchErr);
              });
            }
          });

          client.requestAccessToken({ prompt: 'select_account' });
        } catch (initErr) {
          reject(initErr);
        }
      });
    },

    // Connect real Google account directly
    signInWithDirectGoogle: function(email, fullName, photoURL) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (!email || !email.includes('@')) {
          return reject(new Error('Please enter a valid Google email address.'));
        }
        var cleanEmail = email.trim().toLowerCase();
        var cleanName = (fullName && fullName.trim()) ? fullName.trim() : cleanEmail.split('@')[0];
        
        var user = {
          uid: 'google_' + btoa(cleanEmail).replace(/=/g, ''),
          displayName: cleanName,
          email: cleanEmail,
          photoURL: photoURL || '',
          provider: 'google',
          createdAt: new Date().toISOString()
        };

        self.setUser(user);
        resolve(user);
      });
    },

    // Create a new Account (Email & Password)
    createAccount: function(fullName, email, password) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (!fullName || !fullName.trim()) {
          return reject(new Error('Please enter your full name.'));
        }
        if (!email || !email.includes('@')) {
          return reject(new Error('Please enter a valid email address.'));
        }
        if (!password || password.length < 6) {
          return reject(new Error('Password must be at least 6 characters long.'));
        }

        var cleanEmail = email.trim().toLowerCase();
        var cleanName = fullName.trim();
        var db = getStoredUsers();

        if (db[cleanEmail]) {
          return reject(new Error('An account with this email already exists. Please sign in instead.'));
        }

        var newUser = {
          uid: 'usr_' + btoa(cleanEmail).replace(/=/g, ''),
          displayName: cleanName,
          email: cleanEmail,
          passwordHash: btoa(password),
          photoURL: '',
          provider: 'email',
          createdAt: new Date().toISOString()
        };

        db[cleanEmail] = newUser;
        saveStoredUsers(db);

        self.setUser(newUser);
        resolve(newUser);
      });
    },

    // Sign in with Email / Password
    signInWithEmail: function(email, password) {
      var self = this;
      return new Promise(function(resolve, reject) {
        if (!email || !email.includes('@')) {
          return reject(new Error('Please enter a valid email address.'));
        }
        if (!password || password.length < 4) {
          return reject(new Error('Please enter your password.'));
        }

        var cleanEmail = email.trim().toLowerCase();
        var db = getStoredUsers();
        var existing = db[cleanEmail];

        if (existing) {
          if (existing.passwordHash && existing.passwordHash !== btoa(password)) {
            return reject(new Error('Incorrect password. Please try again.'));
          }
          self.setUser(existing);
          return resolve(existing);
        }

        // New email sign-in fallback (auto-registers seamless account)
        var prefix = cleanEmail.split('@')[0];
        var autoName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        var autoUser = {
          uid: 'usr_' + btoa(cleanEmail).replace(/=/g, ''),
          displayName: autoName,
          email: cleanEmail,
          passwordHash: btoa(password),
          photoURL: '',
          provider: 'email',
          createdAt: new Date().toISOString()
        };
        db[cleanEmail] = autoUser;
        saveStoredUsers(db);

        self.setUser(autoUser);
        resolve(autoUser);
      });
    },

    // Sign in as Guest / Demo Student
    signInAsGuest: function() {
      var guestUser = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        displayName: 'Guest Student',
        email: 'guest.student@studyarena.internal',
        photoURL: '',
        provider: 'guest',
        isGuest: true,
        createdAt: new Date().toISOString()
      };
      this.setUser(guestUser);
      return Promise.resolve(guestUser);
    },

    // Sign out
    signOut: function() {
      this.setUser(null);
      return Promise.resolve();
    }
  };

  window.StudyArenaAuth = Auth;
})(window);
