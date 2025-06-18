import React, { useState } from 'react';
import * as api from '../api';

function OtpValidationScreen({ cpf, onOtpSuccess }) {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleValidateOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp || otp.length !== 6) {
            setError('Por favor, insira um código de 6 dígitos.');
            return;
        }

        try {
        const response = await api.validateOtp(cpf, otp);
        if (response.success) {
            // Passa os dados do usuário para o App.js finalizar o login
            onOtpSuccess(response.user);
        }
        } catch (err) {
        setError(err.message || 'Falha na validação do OTP.');
        }
    };

    return (
        <div className="login-container">
        <form onSubmit={handleValidateOtp}>
            <h2>Validação de Segurança</h2>
            <p>Enviamos um código de 6 dígitos para você. Por favor, verifique o console do backend para testes.</p>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
            <label>Código OTP:</label>
            <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
            />
            </div>
            <button type="submit">Validar Código</button>
        </form>
        </div>
    );
}

export default OtpValidationScreen;