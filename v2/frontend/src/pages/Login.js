window.Login = {
    async render() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="auth-container">
                <div class="card" style="width: 100%; max-width: 400px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <h1 style="color:var(--primary); font-size: 28px; margin-bottom: 8px;">Delivery CRM</h1>
                        <p style="color:var(--text-muted)">v2.0 Production Suite</p>
                    </div>
                    
                    <form id="loginForm">
                        <div style="margin-bottom: 20px;">
                            <label style="display:block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color:var(--text-muted);">Email Address</label>
                            <input type="email" id="email" placeholder="name@company.com" required>
                        </div>
                        <div style="margin-bottom: 24px;">
                            <label style="display:block; font-size: 13px; font-weight: 600; margin-bottom: 8px; color:var(--text-muted);">Password</label>
                            <input type="password" id="password" placeholder="••••••••" required>
                        </div>
                        
                        <div id="loginError" style="color:var(--danger); font-size: 13px; margin-bottom: 16px; display:none;"></div>
                        
                        <button type="submit" class="btn-primary" id="loginBtn">Sign In</button>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const errorDiv = document.getElementById('loginError');
            
            errorDiv.style.display = 'none';
            btn.disabled = true;
            btn.textContent = 'Verifying...';

            try {
                const credentials = {
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                };
                const res = await api.auth.login(credentials);
                
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                
                window.location.hash = '#dashboard';
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Sign In';
            }
        };
    }
};
