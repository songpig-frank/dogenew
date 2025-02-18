import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>© 2025 DOGEcuts.org. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <Link to="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link to="/contact" className="hover:text-foreground">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
