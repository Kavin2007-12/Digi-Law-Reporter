import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/case_model.dart';
import '../providers/bookmark_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/app_header.dart';
import '../widgets/court_badge.dart';

class CaseDetailScreen extends StatelessWidget {
  final CaseModel caseItem;

  const CaseDetailScreen({Key? key, required this.caseItem}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bookmarkProvider = Provider.of<BookmarkProvider>(context);
    final isSaved = bookmarkProvider.isCaseSaved(caseItem.id);

    return Scaffold(
      appBar: AppHeader(
        showBackButton: true,
        onBackTap: () => Navigator.pop(context),
      ),
      backgroundColor: AppColors.surfaceWhite,
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Court Name Badge & Year Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      CourtBadge(courtName: caseItem.court),
                      if (caseItem.year.isNotEmpty)
                        Text(
                          'Year: ${caseItem.year}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textMuted,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // 2. Case Title (e.g. Kesavananda Bharati v. State of Kerala)
                  Text(
                    caseItem.title,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 14),

                  // 3. Official Citation Container with Copy Action
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.blueSurface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.blueBorder),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'OFFICIAL CITATION',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryBlue,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                caseItem.citation,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryNavy,
                                ),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: caseItem.citation));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Citation copied to clipboard!'),
                                duration: Duration(seconds: 2),
                                backgroundColor: AppColors.primaryBlue,
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryBlue,
                            foregroundColor: AppColors.textWhite,
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            visualDensity: VisualDensity.compact,
                          ),
                          icon: const Icon(Icons.copy, size: 14),
                          label: const Text('Copy Citation', style: TextStyle(fontSize: 11)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 4. CASE INFORMATION Section
                  const _SectionHeader(title: 'CASE INFORMATION'),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.subtleSlate,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderSlate),
                    ),
                    child: Column(
                      children: [
                        if (caseItem.appellant.isNotEmpty)
                          _MetaRow(label: 'Appellant', value: caseItem.appellant),
                        if (caseItem.respondent.isNotEmpty)
                          _MetaRow(label: 'Respondent', value: caseItem.respondent),
                        if (caseItem.judge.isNotEmpty)
                          _MetaRow(label: 'Bench / Coram', value: caseItem.judge),
                        if (caseItem.act.isNotEmpty)
                          _MetaRow(label: 'Acts / Sections', value: caseItem.act),
                        if (caseItem.decisionDate.isNotEmpty)
                          _MetaRow(label: 'Decision Date', value: caseItem.decisionDate),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // 5. HEADNOTE Section
                  if (caseItem.headnote.isNotEmpty) ...[
                    const _SectionHeader(title: 'HEADNOTE & RATIO DECIDENDI'),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.headnoteBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.amberBorder),
                      ),
                      child: Text(
                        caseItem.headnote,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF78350F),
                          height: 1.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // 6. FULL JUDGMENT Section
                  const _SectionHeader(title: 'FULL JUDGMENT CONTENT'),
                  const SizedBox(height: 8),
                  Text(
                    caseItem.content.isNotEmpty
                        ? caseItem.content
                        : 'Full verbatim judgment content is loaded from certified repository records...',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textPrimary,
                      height: 1.7,
                      fontFamily: 'serif',
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),

          // Bottom Action Bar: Bookmark & Download PDF
          Container(
            padding: const EdgeInsets.all(14),
            decoration: const BoxDecoration(
              color: AppColors.surfaceWhite,
              border: Border(top: BorderSide(color: AppColors.borderSlate)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      bookmarkProvider.toggleSaveCase(caseItem);
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(color: isSaved ? AppColors.primaryBlue : AppColors.borderSlate),
                    ),
                    icon: Icon(
                      isSaved ? Icons.bookmark : Icons.bookmark_border,
                      color: isSaved ? AppColors.primaryBlue : AppColors.textSecondary,
                    ),
                    label: Text(
                      isSaved ? 'Saved Case' : 'Bookmark Case',
                      style: TextStyle(
                        color: isSaved ? AppColors.primaryBlue : AppColors.textSecondary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w900,
            color: AppColors.primaryBlue,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 4),
        const Divider(color: AppColors.borderSlate, height: 1),
      ],
    );
  }
}

class _MetaRow extends StatelessWidget {
  final String label;
  final String value;

  const _MetaRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppColors.textMuted,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
