import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:digi_law_reporter_mobile/providers/auth_provider.dart';
import 'package:digi_law_reporter_mobile/providers/search_provider.dart';
import 'package:digi_law_reporter_mobile/providers/bookmark_provider.dart';
import 'package:digi_law_reporter_mobile/theme/app_theme.dart';
import 'package:digi_law_reporter_mobile/screens/splash_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const DigiLawReporterApp());
}

class DigiLawReporterApp extends StatelessWidget {
  const DigiLawReporterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => SearchProvider()),
        ChangeNotifierProvider(create: (_) => BookmarkProvider()),
      ],
      child: MaterialApp(
        title: 'Digi Law Reporter',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        home: const SplashScreen(),
      ),
    );
  }
}
