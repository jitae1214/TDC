import React from 'react';
import EmailVerification from '../components/EmailVerification';
import './EmailVerificationPage.css';

const EmailVerificationPage: React.FC = () => {
  return (
    <div className="verification-page">
      <div className="verification-page-container">
        <EmailVerification />
      </div>
    </div>
  );
};

export default EmailVerificationPage; 