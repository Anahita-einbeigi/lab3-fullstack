import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface LoginResponse {
    message: string;
}

function Login () {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate(); 

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post<LoginResponse>('http://localhost:3000/api/users/login', {
                email,
                password
            });
            setMessage(response.data.message);
            navigate('/');
        } catch (error) {
            const axiosError = error as AxiosError<LoginResponse>;
            if (axiosError.response && axiosError.response.status === 404) {
                setMessage('You dont have an account. You must create an account.');
            } else {
                setMessage('log in failed, try again.');
            }
        }
    };

    return (
        <div style={{ width: '300px', margin: 'auto' }}>
            <h2>Sign in</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="E-post"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px' }}>sign in</button>
            </form>
            {message && <p>{message}</p>}
            {message.includes("skapa ett konto") && <Link to="/register">Registrera dig här</Link>}
        </div>
    );
}
export default Login;
