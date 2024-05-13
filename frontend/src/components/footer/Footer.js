// Footer.js

import React from 'react';
import styles from './footer.module.css';

const Footer = () => {
    return (
        <div className={styles.footer}>
            <div className={styles.socialLinks}>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Facebook</a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>YouTube</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Twitter</a>
            </div>
        </div>
    );
};

export default Footer;
