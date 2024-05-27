import { useState } from 'react';
import axios, { AxiosError } from 'axios';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

interface ErrorResponse {
    message: string;
}

function Register(){
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: ''
    });
    const [message, setMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password){
          setMessage('Please fill in all fields.');
          return;
      }

      try {
          const response = await axios.post('http://localhost:3000/api/users/register', formData);
          setMessage(response.data.message);
      } catch (error) {
          if (axios.isAxiosError(error)) {
              const serverError = error as AxiosError<ErrorResponse>;
              if (serverError && serverError.response) {
                  setMessage(serverError.response.data.message);
              } else {
                  setMessage('Something went wrong. Servererror,please try again later.');
              }
          } else {
              setMessage('Something went wrong,please try again later.');
          }
      }
  };


    return (
        <div style={{ width: '300px', margin: 'auto' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="FirstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Lastname"
                        value={formData.lastName}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="E-post"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Telefonnumber"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        name="password"
                        placeholder="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px' }}
                        required
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px' }}>Register</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Register;
