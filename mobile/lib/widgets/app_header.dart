import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final bool showBackButton;
  final VoidCallback? onBackTap;
  final VoidCallback? onNotificationTap;

  const AppHeader({
    Key? key,
    this.showBackButton = false,
    this.onBackTap,
    this.onNotificationTap,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(60.0);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.surfaceWhite,
      elevation: 0,
      surfaceTintColor: AppColors.surfaceWhite,
      automaticallyImplyLeading: false,
      titleSpacing: 16.0,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // LEFT: Back Button or Digital Law Reporter Branding Logo
          if (showBackButton)
            IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 20),
              onPressed: onBackTap ?? () => Navigator.pop(context),
            )
          else
            Row(
              children: [
                // Logo Icon Badge
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: AppColors.primaryBlue,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: const Icon(
                    Icons.balance,
                    color: AppColors.textWhite,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 10),
                // Brand Text
                RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.3,
                      fontFamily: 'Inter',
                    ),
                    children: [
                      TextSpan(text: 'DIGI LAW '),
                      TextSpan(
                        text: 'REPORTER',
                        style: TextStyle(color: AppColors.primaryBlue),
                      ),
                    ],
                  ),
                ),
              ],
            ),

          // RIGHT: Notification / Bell Icon ONLY (No hamburger, No drawer, No profile)
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined, color: AppColors.slate950, size: 24),
                onPressed: onNotificationTap ?? () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Legal Repository Notifications: All court records up to date.'),
                      duration: Duration(seconds: 2),
                      backgroundColor: AppColors.slate950,
                    ),
                  );
                },
              ),
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryBlue,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
