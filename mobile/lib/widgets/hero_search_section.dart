import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class HeroSearchSection extends StatelessWidget {
  const HeroSearchSection({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 1. Background Image (Indian Courthouse, Gavel, Constitution of India)
        Positioned.fill(
          child: Image.asset(
            'assets/hero_bg.jpg',
            fit: BoxFit.cover,
            alignment: Alignment.centerRight,
          ),
        ),

        // 2. Cinematic Dark Navy Gradient Overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.darkNavy.withOpacity(0.95), // #0A1128
                  AppColors.darkNavy.withOpacity(0.85),
                  AppColors.slate950.withOpacity(0.70),
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
          ),
        ),

        // 3. Hero Content (Badge, Title & Subtitle - Search Box Removed)
        Padding(
          padding: const EdgeInsets.fromLTRB(20.0, 24.0, 20.0, 28.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Small Gold / Blue Trust Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.primaryNavy.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.goldAccent.withOpacity(0.6), width: 1),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified, color: AppColors.goldAccent, size: 14),
                    SizedBox(width: 6),
                    Text(
                      'Trusted by Legal Professionals',
                      style: TextStyle(
                        color: AppColors.textWhite,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Main Heading: "Your Trusted Legal Research Partner"
              RichText(
                text: const TextSpan(
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: AppColors.textWhite,
                    letterSpacing: -0.6,
                    height: 1.25,
                    fontFamily: 'Inter',
                  ),
                  children: [
                    TextSpan(text: 'Your Trusted '),
                    TextSpan(
                      text: 'Legal Research',
                      style: TextStyle(
                        color: AppColors.activeBlue, // #3B82F6 / #2563EB accent
                      ),
                    ),
                    TextSpan(text: ' Partner'),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Supporting Text
              const Text(
                'Search, discover and read judgments from across India.',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textWhite,
                  height: 1.4,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
