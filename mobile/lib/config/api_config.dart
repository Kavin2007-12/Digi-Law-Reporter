class ApiConfig {
  // Base URL for the Node.js Express backend API
  // Use http://localhost:5000/api for iOS / Web / Desktop
  // Use http://10.0.2.2:5000/api for Android Emulator
  // Use http://192.168.x.x:5000/api for Physical Mobile Device on local Wi-Fi
  static const String baseUrl = 'http://localhost:5000/api';

  // Auth endpoints
  static const String loginUrl = '$baseUrl/auth/login';
  static const String signupUrl = '$baseUrl/auth/signup';
  static const String savedCasesUrl = '$baseUrl/auth/saved-cases';

  // Search endpoints (Backend public search)
  static const String searchUrl = '$baseUrl/public/search';

  // Cases endpoints
  static const String casesUrl = '$baseUrl/cases';

  // Public endpoints
  static const String healthUrl = '$baseUrl/health';
}
