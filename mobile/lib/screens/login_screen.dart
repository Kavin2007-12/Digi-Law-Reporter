import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/app_header.dart';

class LoginScreen extends StatefulWidget {
  final Widget? targetScreen;

  const LoginScreen({Key? key, this.targetScreen}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _mobileController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.loginWithMobile(
        name: _nameController.text.trim(),
        mobile: _mobileController.text.trim(),
      );

      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Welcome, ${_nameController.text.trim()}! Signed in successfully.'),
            backgroundColor: const Color(0xFF2563EB),
            duration: const Duration(seconds: 2),
          ),
        );

        if (widget.targetScreen != null) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => widget.targetScreen!),
          );
        } else {
          Navigator.pop(context);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppHeader(
        showBackButton: true,
        onBackTap: () => Navigator.pop(context),
      ),
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Welcome Back',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0F172A),
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Sign in to access your saved judgments & search portal.',
                style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 28),

              if (authProvider.errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Color(0xFFDC2626), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          authProvider.errorMessage!,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF991B1B)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // 1. Full Name Input
              const Text(
                'Full Name',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameController,
                keyboardType: TextInputType.name,
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter your full name' : null,
                decoration: InputDecoration(
                  hintText: 'Enter your full name...',
                  prefixIcon: const Icon(Icons.person_outline, size: 20, color: Color(0xFF2563EB)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 18),

              // 2. Mobile Number Input
              const Text(
                'Mobile Number',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Please enter mobile number';
                  }
                  if (val.trim().length < 10) {
                    return 'Please enter valid 10-digit mobile number';
                  }
                  return null;
                },
                decoration: InputDecoration(
                  hintText: 'Enter 10-digit mobile number...',
                  prefixIcon: const Icon(Icons.phone_android_outlined, size: 20, color: Color(0xFF2563EB)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: authProvider.isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: authProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
