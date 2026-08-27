import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../widgets/app_header.dart';
import '../widgets/hero_search_section.dart';
import '../widgets/explore_courts_section.dart';
import '../widgets/case_card.dart';
import '../widgets/skeleton_widgets.dart';
import '../providers/search_provider.dart';
import 'main_navigation_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = Provider.of<SearchProvider>(context);

    return Scaffold(
      appBar: const AppHeader(),
      backgroundColor: AppColors.appBackground,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. HERO SECTION (Dark Navy background image, trust badge & title)
            const HeroSearchSection(),

            // 2. EXPLORE COURTS (Supreme Court | High Courts | Tribunals)
            const ExploreCourtsSection(),

            // 3. RECENT JUDGMENTS & REPOSITORIES
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Section Header: "Recent Judgments & Repositories" & "View All →"
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Recent Judgments & Repositories',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const MainNavigationScreen(initialIndex: 1),
                            ),
                          );
                        },
                        child: const Row(
                          children: [
                            Text(
                              'View All',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryBlue,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward, size: 14, color: AppColors.primaryBlue),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Judgment Cards
                  if (searchProvider.cases.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(24),
                      alignment: Alignment.center,
                      child: const Text('No recent judgments found.'),
                    )
                  else
                    ...searchProvider.cases.map((c) => CaseCard(caseItem: c)).toList(),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
