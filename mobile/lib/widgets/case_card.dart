import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/case_model.dart';
import '../providers/auth_provider.dart';
import '../providers/bookmark_provider.dart';
import '../theme/app_colors.dart';
import '../screens/case_detail_screen.dart';
import '../screens/login_screen.dart';
import 'court_badge.dart';

class CaseCard extends StatelessWidget {
  final CaseModel caseItem;

  const CaseCard({
    Key? key,
    required this.caseItem,
  }) : super(key: key);

  void _onReadFullJudgmentTap(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (!authProvider.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please sign in with your Name & Mobile to read full judgment.'),
          backgroundColor: AppColors.primaryBlue,
          duration: Duration(seconds: 2),
        ),
      );
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => LoginScreen(
            targetScreen: CaseDetailScreen(caseItem: caseItem),
          ),
        ),
      );
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CaseDetailScreen(caseItem: caseItem),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookmarkProvider = Provider.of<BookmarkProvider>(context);
    final isSaved = bookmarkProvider.isCaseSaved(caseItem.id);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSlate),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          hoverColor: AppColors.blueSurface, // Smooth 0ms latency hardware-accelerated hover background!
          mouseCursor: SystemMouseCursors.click,
          onTap: () => _onReadFullJudgmentTap(context),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Top Row: Court Badge & Official Citation
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          CourtBadge(courtName: caseItem.court),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.subtleSlate,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.borderSlate),
                            ),
                            child: Text(
                              caseItem.citation,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      constraints: const BoxConstraints(),
                      padding: EdgeInsets.zero,
                      icon: Icon(
                        isSaved ? Icons.bookmark : Icons.bookmark_border,
                        color: isSaved ? AppColors.primaryBlue : AppColors.textMuted,
                        size: 22,
                      ),
                      onPressed: () {
                        bookmarkProvider.toggleSaveCase(caseItem);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // 2. Case Title
                Text(
                  caseItem.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),

                // 3. Headnote
                if (caseItem.headnote.isNotEmpty)
                  Text(
                    caseItem.headnote,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textMuted,
                      height: 1.4,
                    ),
                  ),

                const SizedBox(height: 12),
                const Divider(color: AppColors.borderSlate, height: 1),
                const SizedBox(height: 10),

                // 4. Footer Meta
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Year: ${caseItem.year}',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                      ),
                    ),
                    InkWell(
                      onTap: () => _onReadFullJudgmentTap(context),
                      splashFactory: NoSplash.splashFactory,
                      child: const Row(
                        children: [
                          Text(
                            'Read Full Judgment',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
