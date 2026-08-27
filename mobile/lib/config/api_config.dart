class ApiConfig {
  // Base URL for the Node.js Express backend
  // Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator / Web, or IP address for physical phone
  static const String baseUrl = 'http://localhost:5000/api';

  // Auth endpoints
  static const String loginUrl = '$baseUrl/auth/login';
  static const String signupUrl = '$baseUrl/auth/signup';
  static const String savedCasesUrl = '$baseUrl/auth/saved-cases';

  // Search endpoints
  static const String searchUrl = '$baseUrl/search';

  // Cases endpoints
  static const String casesUrl = '$baseUrl/cases';

  // Public endpoints
  static const String healthUrl = '$baseUrl/health';
}
