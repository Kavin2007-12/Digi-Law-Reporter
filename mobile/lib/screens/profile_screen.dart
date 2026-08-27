import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/bookmark_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/app_header.dart';
import '../widgets/case_card.dart';
import '../widgets/skeleton_widgets.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final bookmarkProvider = Provider.of<BookmarkProvider>(context);
    final user = authProvider.user;
    final savedCases = bookmarkProvider.savedCases;



    // If user is NOT logged in, directly open the Login Page
    if (user == null) {
      return const Scaffold(
        appBar: AppHeader(),
        backgroundColor: AppColors.surfaceWhite,
        body: _DirectLoginForm(),
      );
    }

    // If user IS logged in, show their simplified profile details & saved judgments
    return Scaffold(
      appBar: const AppHeader(),
      backgroundColor: AppColors.appBackground,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Simplified Logged In Profile Card (Name & Mobile ONLY)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSlate),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x05000000),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 32,
                    backgroundColor: AppColors.primaryBlue,
                    child: Text(
                      user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textWhite,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    user.name,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Mobile: ${user.mobile}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Logout Action
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        authProvider.logout();
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        side: const BorderSide(color: AppColors.errorRed),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      icon: const Icon(Icons.logout, color: AppColors.errorRed, size: 16),
                      label: const Text(
                        'Sign Out Account',
                        style: TextStyle(
                          color: AppColors.errorRed,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 2. SAVED JUDGMENTS SECTION
            Row(
              children: [
                const Icon(Icons.bookmark, color: AppColors.primaryBlue, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Saved Judgments (${savedCases.length})',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (savedCases.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surfaceWhite,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderSlate),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.bookmark_border, size: 40, color: AppColors.textMuted),
                    SizedBox(height: 10),
                    Text(
                      'No Saved Judgments Yet',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Tap the bookmark icon on any judgment to save it here for quick access.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              )
            else
              ...savedCases.map((c) => CaseCard(caseItem: c)).toList(),

            const SizedBox(height: 30),
            const Center(
              child: Text(
                'Digital Law Reporter Mobile v1.0.0',
                style: TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

/// Direct Login Form Component embedded directly in Profile when unauthenticated
class _DirectLoginForm extends StatefulWidget {
  const _DirectLoginForm({Key? key}) : super(key: key);

  @override
  State<_DirectLoginForm> createState() => _DirectLoginFormState();
}

class _DirectLoginFormState extends State<_DirectLoginForm> {
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
            backgroundColor: AppColors.primaryBlue,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return SingleChildScrollView(
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
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Sign in to access your saved judgments & search portal.',
              style: TextStyle(fontSize: 13, color: AppColors.textMuted),
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
                    const Icon(Icons.error_outline, color: AppColors.errorRed, size: 18),
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
                prefixIcon: const Icon(Icons.person_outline, size: 20, color: AppColors.primaryBlue),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.borderSlate),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.5),
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
                prefixIcon: const Icon(Icons.phone_android_outlined, size: 20, color: AppColors.primaryBlue),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.borderSlate),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.5),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Sign In Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: authProvider.isLoading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryBlue,
                  foregroundColor: AppColors.textWhite,
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
    );
  }
}
