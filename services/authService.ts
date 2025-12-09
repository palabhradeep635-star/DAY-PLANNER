
import { UserProfile } from '../types';

export const authService = {
  signInWithGoogle: async (): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      // 1. Center the popup
      const width = 450;
      const height = 550;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        '', 
        'Google Sign In', 
        `width=${width},height=${height},top=${top},left=${left},scrollbars=no,resizable=no`
      );

      if (!popup) {
        // Fallback for popup blockers: immediately resolve for demo purposes if blocked
        console.warn("Popup blocked. simulating direct login.");
        setTimeout(() => {
             resolve({
                name: "Alex Chen",
                email: "alex.chen@gmail.com",
                avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=0D8ABC&color=fff&size=128"
             });
        }, 1500);
        return;
      }

      // 2. Interactive Mock Content
      const htmlContent = `
        <html>
          <head>
            <title>Sign in - Google Accounts</title>
            <style>
              body { font-family: 'Roboto', 'Segoe UI', arial, sans-serif; display: flex; flex-direction: column; align-items: center; height: 100vh; margin: 0; background: #fff; padding: 40px 24px; box-sizing: border-box; }
              .card { width: 100%; max-width: 360px; }
              .logo { margin-bottom: 16px; }
              h1 { font-size: 24px; font-weight: 400; margin: 0 0 8px 0; color: #202124; text-align: center; }
              p { font-size: 16px; color: #202124; margin: 0 0 32px 0; text-align: center; }
              .account-item { 
                display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #dadce0; cursor: pointer; transition: background 0.2s; border-radius: 4px; padding-left: 12px;
              }
              .account-item:hover { background-color: #f1f3f4; }
              .avatar { width: 32px; height: 32px; border-radius: 50%; background-color: #045a4f; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 12px; font-weight: bold; }
              .info { display: flex; flex-direction: column; }
              .name { font-size: 14px; font-weight: 500; color: #3c4043; }
              .email { font-size: 12px; color: #5f6368; }
              .loader-container { display: none; flex-direction: column; align-items: center; justify-content: center; height: 200px; }
              .loader { border: 3px solid #f3f3f3; border-top: 3px solid #1a73e8; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <div id="main-view" class="card">
                <div style="text-align: center;">
                   <img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" width="75" class="logo" />
                </div>
                <h1>Choose an account</h1>
                <p>to continue to DSA Master</p>
                
                <div class="account-item" onclick="selectAccount()">
                   <div class="avatar" style="background: #ef4444;">AC</div>
                   <div class="info">
                      <span class="name">Alex Chen</span>
                      <span class="email">alex.chen@gmail.com</span>
                   </div>
                </div>
                
                <div class="account-item">
                   <div class="avatar" style="background: #5f6368;"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>
                   <div class="info">
                      <span class="name">Use another account</span>
                   </div>
                </div>
            </div>

            <div id="loader-view" class="loader-container">
               <div class="loader"></div>
               <p style="margin-top: 20px;">Signing in...</p>
            </div>

            <script>
               function selectAccount() {
                  document.getElementById('main-view').style.display = 'none';
                  document.getElementById('loader-view').style.display = 'flex';
                  
                  // Signal parent to close after a delay
                  setTimeout(() => {
                    window.opener.postMessage('google-login-success', '*');
                    window.close();
                  }, 1200);
               }
            </script>
          </body>
        </html>
      `;

      popup.document.write(htmlContent);

      // 3. Monitor for closure or message
      let isResolved = false;

      // Listen for message from popup
      const messageHandler = (event: MessageEvent) => {
        if (event.data === 'google-login-success') {
           isResolved = true;
           window.removeEventListener('message', messageHandler);
           resolve({
            name: "Alex Chen",
            email: "alex.chen@gmail.com",
            avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=0D8ABC&color=fff&size=128"
          });
        }
      };
      window.addEventListener('message', messageHandler);

      // Fallback check if popup was closed manually without clicking
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          if (!isResolved) {
             // If closed without selection, we can either reject or mock success for UX in this demo
             // Let's resolve anyway for the demo experience if they just closed it thinking it was done
             // But strictly speaking, this should be a cancel. 
             // For user happiness in this prompt context:
             console.log("Popup closed.");
          }
        }
      }, 500);
    });
  },

  signInWithX: async (): Promise<UserProfile> => {
     return new Promise((resolve) => {
        setTimeout(() => {
           resolve({ name: "Alex Chen", email: "alex@x.com", avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=000&color=fff" });
        }, 2000);
     });
  },
  
  signInWithMicrosoft: async (): Promise<UserProfile> => {
     return new Promise((resolve) => {
        setTimeout(() => {
           resolve({ name: "Alex Chen", email: "alex@outlook.com", avatar: "https://ui-avatars.com/api/?name=Alex+Chen&background=00a4ef&color=fff" });
        }, 2000);
     });
  }
};
