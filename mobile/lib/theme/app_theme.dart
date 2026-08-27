import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Centralized ThemeData for Digital Law Reporter Mobile App (Flicker-Free Theme)
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      splashFactory: NoSplash.splashFactory,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      hoverColor: Colors.transparent,
      focusColor: Colors.transparent,
      scaffoldBackgroundColor: AppColors.appBackground,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryBlue,
        secondary: AppColors.slate950,
        surface: AppColors.surfaceWhite,
        background: AppColors.appBackground,
        error: AppColors.errorRed,
      ),
      fontFamily: 'Inter',
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: _NoTransitionsBuilder(),
          TargetPlatform.iOS: _NoTransitionsBuilder(),
          TargetPlatform.windows: _NoTransitionsBuilder(),
          TargetPlatform.macOS: _NoTransitionsBuilder(),
          TargetPlatform.linux: _NoTransitionsBuilder(),
        },
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfaceWhite,
        elevation: 0,
        surfaceTintColor: AppColors.surfaceWhite,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.surfaceWhite,
        selectedItemColor: AppColors.primaryBlue,
        unselectedItemColor: AppColors.textMuted,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surfaceWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: AppColors.borderSlate, width: 1),
        ),
      ),
    );
  }
}

class _NoTransitionsBuilder extends PageTransitionsBuilder {
  const _NoTransitionsBuilder();

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return child;
  }
}
