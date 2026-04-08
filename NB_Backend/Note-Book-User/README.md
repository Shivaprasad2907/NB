NB BAckend Server Creation:
Phase 1:
    - First phase of Login and Register Module is Created without Security using H2-DataBase
    - Created User Model 
        - Register
            - Registering User Details 
        - Login
            - Pulls User Email and Password 
        - Address
            - Used for Address Module Linked to Both Register and UserDetail Classes
        - UserDetails
            - Severs as Pull Details of all user information for updating, Gathering/pull Details From database

Phase 2:
    
    - Creating Password Encrypting and Verifying Encrypted Password for security 
        - Adding Spring Security in pom.xml
        - Creating Security Config and context
        - and Password Encoder

phase 3: 
    - Advance Security at registration and login verification:
         - Register
            - Registering User Details for first time and send successfully register email with first time login verification link
        - Login
            - Pulls User Email and Password according to given information by user at login page and verify through email for user Exists in database
            - send Account Locked email after login attempt failed for 5 times.

        - Implementing API for Update UserDetails , 
        - Forget Password from login and after submit email verify and send password reset mail to that user if exist, 
        - Reset Password from user details after login can set , 
        - Delete user API with hold the deleted user details for 60 days in delete dump files/ or in 
          user database with reducing days counter from user delete day


        

Hey, I'm gona explain about my project structure and implementation till Now:

- I have creating a notebook just similar to word
- I Have implemented Basic Frontend for notebook and it dashboard with notebook link
- along with it i have implemented login, register, reset password, forgot password pages with react.js + vite
- and
- Till now i have built backend with spring boot considering of implementation of
- user module having userDetails, userRegister, userLogin, Address( is an using @Embedded on userDetails )
- implemented login api, register api having with spring security 
- spring security implemented till now up to password encoding
- verifying the password encoder through login
- implemented securityConfig with basic implementation with securityFilterChain 

and 
- want to implement about jwt with session management, oauth(with userdetail storage to database and vice vers)
- session tracking , session id(details) storage up to last 3 sessions with all pages associated with all pages link in dashboard after login.



                            Registeration page
                                |
                            User Filled Details
                                |
                            user Register
                                |
                            Email Verification mail sent
                                |
                            User Login\
                                |
                            user verified or not
                                |
                               / \
                       verified   not -------> verifiy email first ( Verification is doing well)
                            |
                        Login Succesful 
                            |
                        Entiled with jwt token