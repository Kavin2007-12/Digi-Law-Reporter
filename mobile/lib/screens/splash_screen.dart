import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/search_provider.dart';
import '../theme/app_colors.dart';
import 'main_navigation_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeApp();
    });
  }

  Future<void> _initializeApp() async {
    final searchProvider = Provider.of<SearchProvider>(context, listen: false);
    
    // Initial data fetch & minimum 1.5s delay for smooth brand logo display
    await Future.wait([
      searchProvider.performSearch(),
      Future.delayed(const Duration(milliseconds: 1600)),
    ]);

    if (mounted) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const MainNavigationScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 350),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A1128), // Deep Blue Background Screen
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // 1. Official Logo Image / Badge
              Image.asset(
                'assets/logo.png',
                height: 90,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 84,
                    height: 84,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2563EB), Color(0xFF1E40AF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2563EB).withOpacity(0.45),
                          blurRadius: 28,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.balance,
                      color: Colors.white,
                      size: 48,
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // 2. Official Brand Name Below Logo: "Digi Law Reporter"
              RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.5,
                  ),
                  children: [
                    TextSpan(
                      text: 'Digi Law ',
                      style: TextStyle(color: Color(0xFF60A5FA)), // Bright Blue Accent
                    ),
                    TextSpan(
                      text: 'Reporter',
                      style: TextStyle(color: Colors.white), // Pure White Text on Blue Screen
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'INDIA\'S DIGITAL LEGAL REPOSITORY',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                  color: Color(0xFF94A3B8),
                ),
              ),

              const Spacer(),

              // 3. Smooth Loading Indicator at bottom
              const Padding(
                padding: EdgeInsets.only(bottom: 40.0),
                child: SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF3B82F6)),
                    strokeWidth: 2.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
