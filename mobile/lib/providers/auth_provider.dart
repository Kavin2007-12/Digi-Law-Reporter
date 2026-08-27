import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AuthProvider() {
    _loadSavedUser();
  }

  // Load saved session on app startup
  Future<void> _loadSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      try {
        _user = UserModel.fromJson(jsonDecode(userString));
        notifyListeners();
      } catch (e) {
        print('Error loading saved user: $e');
      }
    }
  }

  // Simplified Direct Login with Full Name & Mobile Number (No OTP, No Password)
  Future<bool> loginWithMobile({required String name, required String mobile}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    // First attempt to call backend if online, fallback to direct session creation
    UserModel? result = await ApiService.login(mobile, 'mobile_pass');

    if (result == null) {
      // Create instant user session directly with Name & Mobile
      result = UserModel(
        id: mobile,
        name: name,
        mobile: mobile,
        email: '${mobile}@digilawreporter.in',
        role: 'Advocate',
      );
    } else {
      // Ensure user name matches entered name
      result = UserModel(
        id: result.id,
        name: name,
        mobile: mobile,
        email: result.email.isNotEmpty ? result.email : '${mobile}@digilawreporter.in',
        role: result.role.isNotEmpty ? result.role : 'Advocate',
        token: result.token,
      );
    }

    _isLoading = false;
    _user = result;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(result.toJson()));
    notifyListeners();
    return true;
  }

  // Legacy login fallback
  Future<bool> login(String identifier, String password) async {
    return loginWithMobile(name: 'Advocate User', mobile: identifier);
  }

  // Signup action
  Future<bool> signup({
    required String name,
    required String email,
    required String mobile,
    required String password,
  }) async {
    return loginWithMobile(name: name, mobile: mobile);
  }

  // Logout action
  Future<void> logout() async {
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    notifyListeners();
  }
}
