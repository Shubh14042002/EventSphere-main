import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './forgotpassword.module.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch('http://localhost:3001/reset/forget', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('If your email is registered, you will receive a password reset code.');
            } else {
                setMessage(data.message || 'An error occurred. Please try again.');
            }
            navigate('/');
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await fetch('http://localhost:3001/reset/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, resetCode, newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Your password has been reset successfully.');
            } else {
                setMessage(data.message || 'Failed to reset password. Please try again.');
            }
            navigate('/');
        } catch (error) {
            setMessage('Failed to reset password. Please try again.');
        }
    };

    return (
        <div className={styles.forgotPasswordBackground}>
            <div className={styles.forgotPassword}>
                <section>
                    <h2>Request Password Reset</h2>
                    <form onSubmit={handleRequestReset}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                            <button type="submit">Send Reset Code</button>
                        </form>
                    </section>
            
                    <section>
                        <h2>Change Password</h2>
                        <form onSubmit={handleChangePassword}>
                        <label htmlFor="resetEmail">Email:</label>
                        <input
                            type="email"
                            id="resetEmail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor="resetCode">Reset Code:</label>
                        <input
                            type="text"
                            id="resetCode"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
                            required
                        />
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Change Password</button>
                    </form>
                </section>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}       

export default ForgotPassword;