package com.notebook.serviceimpl;


public class EmailTemplateBuilder {

    public static String buildVerificationTemplate(String name, String link) {

        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f6f8;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    background: #ffffff;
                    margin: auto;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.05);
                }
                .header {
                    text-align: center;
                    color: #2c3e50;
                }
                .button {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 12px 24px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                }
                .footer {
                    font-size: 12px;
                    color: #777;
                    text-align: center;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 class="header">Welcome to Learning Platform</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your registration was successful. Please verify your email address to activate your account.</p>

                <div style="text-align:center;">
                    <a href="%s" class="button">Verify Email</a>
                </div>

                <p>This verification link will expire in <b>24 hours</b>.</p>

                <p>If you didn’t create this account, you can safely ignore this email.</p>

                <div class="footer">
                    © 2026 Learning Platform. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """.formatted(name, link);
    }
}

