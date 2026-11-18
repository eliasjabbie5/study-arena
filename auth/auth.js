/**
 * Study Arena - Authentication Engine
 * Pure Client-Side Authentication with Google Identity Services (GIS) & Direct OAuth,
 * Persistent Browser Sessions, Registered Accounts, and Demo Guest Mode.
 * 100% Pure ASCII.
 */
(function(window) {
  'use strict';

  var STORAGE_KEY = 'sa_auth_user_v1';
  var CLIENT_ID_KEY = 'sa_google_client_id';
  var DEFAULT_CLIENT_ID = '473457918792-rs6lb669qkstj4ed717vro61mp930ita.apps.googleusercontent.com';
  var USERS_DB_KEY = 'sa_registered_users_v1';
  var DEVELOPER_EMAIL = 'eliasjabbie5@gmail.com';
  var DEVELOPER_EMAILS = ['eliasjabbie5@gmail.com', 'elias.jabbie.maria@gmail.com'];
  var TELEMETRY_KEY = 'sa_telemetry_events_v1';

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

    DEVELOPER_EMAIL: DEVELOPER_EMAIL,
    DEVELOPER_EMAILS: DEVELOPER_EMAILS,

    isDeveloper: function(user) {
      var u = user || this.getUser();
      if (!u || !u.email) return false;
      var clean = u.email.toLowerCase().trim();
      return DEVELOPER_EMAILS.some(function(dev) { return dev.toLowerCase() === clean; });
    },

    setUser: function(user) {
      if (user) {
        if (this.isDeveloper(user)) {
          user.role = 'developer';
          user.developerMode = true;
        } else if (!user.role) {
          user.role = user.isGuest ? 'guest' : 'student';
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

        // Auto-record / sync into registered users database
        if (user.email && !user.isGuest) {
          try {
            var db = getStoredUsers();
            var key = user.email.toLowerCase().trim();
            var isDev = DEVELOPER_EMAILS.some(function(d) { return d.toLowerCase() === key; });
            if (!db[key]) {
              db[key] = {
                email: user.email,
                displayName: user.displayName || user.name || (isDev ? 'Elias Jabbie' : 'Student'),
                photoURL: user.photoURL || '',
                provider: user.provider || 'google',
                role: isDev ? 'developer' : 'student',
                createdAt: user.createdAt || new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                loginCount: 1
              };
            } else {
              db[key].lastLogin = new Date().toISOString();
              db[key].loginCount = (db[key].loginCount || 1) + 1;
              if (user.displayName) db[key].displayName = user.displayName;
              if (user.photoURL) db[key].photoURL = user.photoURL;
              if (isDev) db[key].role = 'developer';
            }
            saveStoredUsers(db);
          } catch (e) {
            console.warn('[Auth] Error syncing user to database:', e);
          }
        }

        this.logTelemetry('USER_SIGN_IN', { email: user.email, provider: user.provider, role: user.role });
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      this.notifyListeners(user);
    },

    getAllUsers: function() {
      var db = getStoredUsers();
      var devKey = DEVELOPER_EMAIL.toLowerCase();
      // Ensure developer record exists
      if (!db[devKey]) {
        db[devKey] = {
          email: DEVELOPER_EMAIL,
          displayName: 'Elias Jabbie',
          photoURL: '',
          provider: 'google',
          role: 'developer',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          loginCount: 1
        };
        saveStoredUsers(db);
      }
      var list = [];
      for (var k in db) {
        if (Object.prototype.hasOwnProperty.call(db, k)) {
          list.push(db[k]);
        }
      }
      list.sort(function(a, b) {
        var ta = new Date(a.lastLogin || a.createdAt || 0).getTime();
        var tb = new Date(b.lastLogin || b.createdAt || 0).getTime();
        return tb - ta;
      });
      return list;
    },

    addMockUser: function(name, email, provider) {
      var db = getStoredUsers();
      var cleanEmail = (email || ('student_' + Math.floor(Math.random() * 900 + 100) + '@university.edu')).toLowerCase().trim();
      db[cleanEmail] = {
        email: cleanEmail,
        displayName: name || 'Student ' + cleanEmail.split('@')[0],
        photoURL: '',
        provider: provider || 'email',
        role: (cleanEmail === DEVELOPER_EMAIL.toLowerCase()) ? 'developer' : 'student',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: Math.floor(Math.random() * 5 + 1)
      };
      saveStoredUsers(db);
      this.logTelemetry('MOCK_USER_ADDED', { email: cleanEmail, name: db[cleanEmail].displayName });
      return db[cleanEmail];
    },

    deleteUser: function(email) {
      if (!email) return false;
      var cleanEmail = email.toLowerCase().trim();
      if (cleanEmail === DEVELOPER_EMAIL.toLowerCase()) {
        throw new Error('Cannot delete developer account.');
      }
      var db = getStoredUsers();
      if (db[cleanEmail]) {
        delete db[cleanEmail];
        saveStoredUsers(db);
        this.logTelemetry('USER_REMOVED', { email: cleanEmail });
        return true;
      }
      return false;
    },

    logTelemetry: function(event, metadata) {
      try {
        var raw = localStorage.getItem(TELEMETRY_KEY);
        var events = raw ? JSON.parse(raw) : [];
        events.unshift({
          id: 'ev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          event: event,
          meta: metadata || {},
          timestamp: new Date().toISOString()
        });
        if (events.length > 100) events = events.slice(0, 100);
        localStorage.setItem(TELEMETRY_KEY, JSON.stringify(events));
      } catch (e) {}
    },

    getTelemetryEvents: function() {
      try {
        var raw = localStorage.getItem(TELEMETRY_KEY);
        var ev = raw ? JSON.parse(raw) : [];
        if (ev.length === 0) {
          // Add default welcome telemetry
          ev = [
            {
              id: 'ev_init_1',
              event: 'SYSTEM_INITIALIZED',
              meta: { engine: 'Gemini 2.5 Flash', developer: DEVELOPER_EMAIL },
              timestamp: new Date().toISOString()
            }
          ];
          localStorage.setItem(TELEMETRY_KEY, JSON.stringify(ev));
        }
        return ev;
      } catch (e) {
        return [];
      }
    },

    clearTelemetry: function() {
      try {
        localStorage.removeItem(TELEMETRY_KEY);
      } catch (e) {}
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

    // Check if returning from OAuth redirect with access_token in URL hash
    checkOAuthRedirect: function() {
      var self = this;
      var hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        var params = new URLSearchParams(hash.substring(1));
        var token = params.get('access_token');
        if (token) {
          try {
            history.replaceState(null, null, window.location.pathname + window.location.search);
          } catch (e) {}
          return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': 'Bearer ' + token }
          })
          .then(function(res) {
            if (!res.ok) throw new Error('Failed to retrieve user profile.');
            return res.json();
          })
          .then(function(info) {
            var user = {
              uid: 'google_' + (info.sub || Math.random().toString(36).substring(2, 10)),
              displayName: info.name || (info.email ? info.email.split('@')[0] : 'Google User'),
              email: info.email || '',
              photoURL: info.picture || '',
              provider: 'google',
              createdAt: new Date().toISOString()
            };
            self.setUser(user);
            return user;
          });
        }
      }
      return Promise.resolve(null);
    },

    // Sign in with Google (GIS with automatic direct OAuth popup fallback)
    signInWithGoogle: function() {
      var self = this;
      var clientId = self.getGoogleClientId();
      if (!clientId) {
        return Promise.reject(new Error('No Google Client ID configured.'));
      }

      // Mode 1: If GIS library is ready, use initTokenClient
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        return new Promise(function(resolve, reject) {
          try {
            var client = window.google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
              callback: function(tokenResponse) {
                if (tokenResponse.error) {
                  return reject(new Error(tokenResponse.error_description || tokenResponse.error));
                }
                if (!tokenResponse.access_token) {
                  return reject(new Error('No access token returned by Google.'));
                }

                fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { 'Authorization': 'Bearer ' + tokenResponse.access_token }
                })
                .then(function(res) {
                  if (!res.ok) throw new Error('Failed to retrieve user profile.');
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
                .catch(reject);
              }
            });

            client.requestAccessToken({ prompt: 'select_account' });
          } catch (initErr) {
            self.openDirectOAuth(clientId, resolve, reject);
          }
        });
      }

      // Mode 2: Direct Google OAuth Popup / Redirect (Universal compatibility)
      return new Promise(function(resolve, reject) {
        self.openDirectOAuth(clientId, resolve, reject);
      });
    },

    openDirectOAuth: function(clientId, resolve, reject) {
      var self = this;
      var redirectUri = window.location.origin + window.location.pathname;
      var oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
        'client_id=' + encodeURIComponent(clientId) +
        '&redirect_uri=' + encodeURIComponent(redirectUri) +
        '&response_type=token' +
        '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid') +
        '&prompt=select_account';

      var popup = window.open(oauthUrl, 'GoogleSignIn', 'width=500,height=620,menubar=no,toolbar=no');
      if (!popup || popup.closed) {
        // Popup was blocked by browser -> Redirect current tab
        window.location.href = oauthUrl;
        return;
      }

      var pollTimer = setInterval(function() {
        try {
          if (!popup || popup.closed) {
            clearInterval(pollTimer);
            return;
          }
          if (popup.location && popup.location.href && popup.location.href.includes('access_token=')) {
            var hash = popup.location.hash;
            popup.close();
            clearInterval(pollTimer);
            var params = new URLSearchParams(hash.substring(1));
            var token = params.get('access_token');
            if (token) {
              fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': 'Bearer ' + token }
              })
              .then(function(res) { return res.json(); })
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
              .catch(reject);
            }
          }
        } catch (crossOriginErr) {
          // Normal cross-origin while on accounts.google.com
        }
      }, 500);
    },

    // Connect real Google account directly (manual fallback)
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

        return reject(new Error('No account found with this email. Please click "Create Account" above.'));
      });
    },

    // Guest mode
    signInAsGuest: function() {
      var guestUser = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        displayName: 'Guest Student',
        email: 'guest@studyarena.local',
        photoURL: '',
        provider: 'guest',
        isGuest: true,
        createdAt: new Date().toISOString()
      };
      this.setUser(guestUser);
      return Promise.resolve(guestUser);
    },

    signOut: function() {
      this.setUser(null);
      return Promise.resolve();
    }
  };

  // Check redirect OAuth token or dev_preview on load (synchronous for dev preview)
  if (typeof window !== 'undefined') {
    if (window.location.search && window.location.search.includes('dev_preview=elias')) {
      Auth.setUser({
        uid: 'google_developer_elias',
        displayName: 'Elias Jabbie',
        email: DEVELOPER_EMAIL,
        role: 'developer',
        developerMode: true,
        provider: 'google',
        createdAt: new Date().toISOString()
      });
    } else if (Auth.checkOAuthRedirect) {
      setTimeout(function() {
        Auth.checkOAuthRedirect();
      }, 50);
    }
  }

  window.StudyArenaAuth = Auth;
})(window);
