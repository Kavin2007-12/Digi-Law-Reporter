import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../widgets/app_header.dart';
import '../widgets/case_card.dart';
import '../widgets/search_option_card.dart';
import '../widgets/skeleton_widgets.dart';
import '../widgets/empty_state.dart';
import '../providers/search_provider.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedOptionKey = 'keyword'; // 'keyword', 'section', 'citation', 'party', 'topic', 'words'

  final List<Map<String, dynamic>> _searchOptions = const [
    {
      'key': 'keyword',
      'title': 'Keyword Search',
      'desc': 'Search by legal terms, principles, or subjects',
      'icon': Icons.vpn_key_outlined,
      'hint': 'Enter keywords (e.g. Basic Structure, Article 21)...',
    },
    {
      'key': 'section',
      'title': 'Find Content by Section',
      'desc': 'Search by IPC, CrPC, CPC, or Act Section numbers',
      'icon': Icons.menu_book_outlined,
      'hint': 'Enter Section & Act (e.g. Section 302 IPC, Art 368)...',
    },
    {
      'key': 'citation',
      'title': 'Find by Citation',
      'desc': 'Search official reporter citations (AIR, SCC, DLR)',
      'icon': Icons.format_quote_outlined,
      'hint': 'Enter official citation (e.g. AIR 1973 SC 1461)...',
    },
    {
      'key': 'party',
      'title': 'Find by Party Name',
      'desc': 'Search by Petitioner, Appellant, or Respondent name',
      'icon': Icons.people_outline,
      'hint': 'Enter party name (e.g. Kesavananda Bharati, Maneka Gandhi)...',
    },
    {
      'key': 'topic',
      'title': 'Find by Topic',
      'desc': 'Browse rulings grouped under legal subject topics',
      'icon': Icons.category_outlined,
      'hint': 'Enter legal topic (e.g. Constitutional Law, Arbitration)...',
    },
    {
      'key': 'words',
      'title': 'Words & Phrases',
      'desc': 'Search judicial interpretations of legal terms',
      'icon': Icons.text_fields_outlined,
      'hint': 'Enter legal phrase (e.g. Ratio Decidendi, Res Judicata)...',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Map<String, dynamic> get _currentOption {
    return _searchOptions.firstWhere(
      (opt) => opt['key'] == _selectedOptionKey,
      orElse: () => _searchOptions.first,
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final searchProvider = Provider.of<SearchProvider>(context);

    // If user is NOT logged in, open the Login Page directly for Search Portal
    if (!authProvider.isAuthenticated) {
      return const Scaffold(
        appBar: AppHeader(),
        backgroundColor: AppColors.surfaceWhite,
        body: _SearchPortalLoginForm(),
      );
    }

    // If user IS logged in, render the Search Case Repository Portal
    return Scaffold(
      appBar: const AppHeader(),
      backgroundColor: AppColors.appBackground,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'LEGAL RESEARCH PORTAL',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primaryBlue,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Search Case Repository',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 14),

              // Dynamic Search Input Box based on Search Mode:
              // 1. Citation Search Builder Box
              if (_selectedOptionKey == 'citation')
                _CitationBuilderBox(
                  onSearch: (citationQuery) {
                    searchProvider.setQuery(citationQuery);
                  },
                  onClear: () {
                    searchProvider.setQuery('');
                  },
                )
              // 2. Find by Party Name Box (Matching Website Search Layout in compact size)
              else if (_selectedOptionKey == 'party')
                _PartyNameSearchBox(
                  onSearch: (partyQuery, courtFilter) {
                    searchProvider.setQueryAndCourt(partyQuery, courtFilter);
                  },
                  onClear: () {
                    searchProvider.setQueryAndCourt('', '');
                  },
                )
              // 3. Standard Search Input for Keyword, Section, Topic, Words & Phrases
              else
                TextField(
                  controller: _searchController,
                  onChanged: (val) {
                    searchProvider.setQuery(val);
                  },
                  decoration: InputDecoration(
                    hintText: _currentOption['hint'],
                    hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                    prefixIcon: const Icon(Icons.search, color: AppColors.primaryBlue),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              searchProvider.setQuery('');
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    filled: true,
                    fillColor: AppColors.surfaceWhite,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.borderSlate),
                    ),
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

              const Text(
                'Select Search Mode:',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 10),

              // 6 Website Search Capabilities Adaptations
              ..._searchOptions.map((opt) {
                final isSelected = opt['key'] == _selectedOptionKey;
                return SearchOptionCard(
                  title: opt['title'],
                  description: opt['desc'],
                  icon: opt['icon'],
                  isSelected: isSelected,
                  onTap: () {
                    setState(() {
                      _selectedOptionKey = opt['key'];
                    });
                    searchProvider.setMode(opt['key']);
                  },
                );
              }).toList(),

              const SizedBox(height: 20),
              const Divider(color: AppColors.borderSlate),
              const SizedBox(height: 14),

              // Search Results Header & Skeleton Loading / Results
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Search Results (${searchProvider.cases.length})',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Results List / Empty State
              if (searchProvider.cases.isEmpty)
                EmptyStateWidget(
                  title: 'No judgments matching your search',
                  message: 'Try adjusting your search terms or selecting a different search mode.',
                  onActionTap: () {
                    _searchController.clear();
                    searchProvider.setQuery('');
                  },
                  actionLabel: 'Reset Search',
                )
              else
                ...searchProvider.cases.map((c) => CaseCard(caseItem: c)).toList(),
            ],
          ),
        ),
      ),
    );
  }
}

/// Structured Citation Search Builder Box Widget (Clean Mobile Version)
class _CitationBuilderBox extends StatefulWidget {
  final Function(String citation) onSearch;
  final VoidCallback onClear;

  const _CitationBuilderBox({
    Key? key,
    required this.onSearch,
    required this.onClear,
  }) : super(key: key);

  @override
  State<_CitationBuilderBox> createState() => _CitationBuilderBoxState();
}

class _CitationBuilderBoxState extends State<_CitationBuilderBox> {
  final _yearController = TextEditingController(text: '2026');
  final _monthController = TextEditingController();
  String _selectedReporter = 'DLR';
  final _courtController = TextEditingController(text: 'SC');
  final _pageController = TextEditingController();

  final List<String> _reporters = const ['DLR', 'AIR', 'SCC', 'SCALE', 'SCR'];

  @override
  void dispose() {
    _yearController.dispose();
    _monthController.dispose();
    _courtController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _triggerSearch() {
    final year = _yearController.text.trim();
    final month = _monthController.text.trim();
    final court = _courtController.text.trim();
    final page = _pageController.text.trim();

    List<String> parts = [];
    if (_selectedReporter.isNotEmpty) parts.add(_selectedReporter);
    if (year.isNotEmpty) parts.add(year);
    if (month.isNotEmpty) parts.add('($month)');
    if (court.isNotEmpty) parts.add('($court)');
    if (page.isNotEmpty) parts.add(page);

    String citation = parts.join(' ').trim();
    widget.onSearch(citation);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [

          // Citation Formula Fields Container
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.appBackground,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.borderSlate),
            ),
            child: Column(
              children: [
                // Top Row: Year | Month | Reporter | Court
                Row(
                  children: [
                    // Year
                    Expanded(
                      flex: 3,
                      child: _LabeledInput(
                        label: 'Year',
                        hint: '2026',
                        controller: _yearController,
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: 6),
                    // Month
                    Expanded(
                      flex: 2,
                      child: _LabeledInput(
                        label: 'Month',
                        hint: 'MM',
                        controller: _monthController,
                      ),
                    ),
                    const SizedBox(width: 6),
                    // Fixed DLR Reporter Badge
                    Expanded(
                      flex: 3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Reporter',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 3),
                          Container(
                            height: 32,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'DLR',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    // Court
                    Expanded(
                      flex: 2,
                      child: _LabeledInput(
                        label: 'Court',
                        hint: 'SC',
                        controller: _courtController,
                        isBold: true,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Bottom Row: Equivalent Citation / Page Number
                _LabeledInput(
                  label: 'Page # / Equivalent Citation',
                  hint: 'Enter Page or Equivalent Citation (e.g. 1461)',
                  controller: _pageController,
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Bottom Action Row: Clear & Get Citation Button
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton.icon(
                onPressed: () {
                  _yearController.clear();
                  _monthController.clear();
                  _courtController.clear();
                  _pageController.clear();
                  widget.onClear();
                },
                icon: const Icon(Icons.refresh, size: 14, color: AppColors.textMuted),
                label: const Text(
                  'Clear',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
              ),
              ElevatedButton.icon(
                onPressed: _triggerSearch,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  minimumSize: const Size(120, 36),
                  elevation: 0,
                ),
                icon: const Icon(Icons.search, size: 14),
                label: const Text(
                  'Get Citation',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      );
  }
}

class _LabeledInput extends StatelessWidget {
  final String label;
  final String hint;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final bool isBold;

  const _LabeledInput({
    Key? key,
    required this.label,
    required this.hint,
    required this.controller,
    this.keyboardType,
    this.isBold = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.textMuted),
        ),
        const SizedBox(height: 3),
        SizedBox(
          height: 32,
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isBold ? FontWeight.w900 : FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(fontSize: 10, color: AppColors.textMuted),
              contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(6),
                borderSide: const BorderSide(color: AppColors.borderSlate),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(6),
                borderSide: const BorderSide(color: AppColors.borderSlate),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(6),
                borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.5),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Structured Party Name Search Builder Box Widget (Dynamic Backend Court Loading)
class _PartyNameSearchBox extends StatefulWidget {
  final Function(String query, String court) onSearch;
  final VoidCallback onClear;

  const _PartyNameSearchBox({
    Key? key,
    required this.onSearch,
    required this.onClear,
  }) : super(key: key);

  @override
  State<_PartyNameSearchBox> createState() => _PartyNameSearchBoxState();
}

class _PartyNameSearchBoxState extends State<_PartyNameSearchBox> {
  final _partyController = TextEditingController();
  String _selectedCourt = 'All Courts';

  @override
  void dispose() {
    _partyController.dispose();
    super.dispose();
  }

  void _triggerSearch() {
    final party = _partyController.text.trim();
    final court = _selectedCourt == 'All Courts' ? '' : _selectedCourt;
    widget.onSearch(party, court);
  }

  @override
  Widget build(BuildContext context) {
    final searchProvider = Provider.of<SearchProvider>(context);

    // Dynamically fetch and extract unique court names from backend database cases
    final List<String> availableCourts = ['All Courts'];
    for (final c in searchProvider.cases) {
      if (c.court.isNotEmpty && !availableCourts.contains(c.court)) {
        availableCourts.add(c.court);
      }
    }

    if (!availableCourts.contains(_selectedCourt)) {
      _selectedCourt = 'All Courts';
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surfaceWhite,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderSlate),
        boxShadow: const [
          BoxShadow(
            color: Color(0x05000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: SEARCH BY PARTY NAME
          const Text(
            'SEARCH BY PARTY NAME',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 8),

          // 1. Dynamic Court Dropdown Selector (Loaded from DB)
          Container(
            height: 32,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: AppColors.appBackground,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.borderSlate),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedCourt,
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down, size: 16, color: AppColors.textSecondary),
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                items: availableCourts.map((court) {
                  return DropdownMenuItem<String>(
                    value: court,
                    child: Text(court),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedCourt = val;
                    });
                    _triggerSearch();
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 8),

          // 2. Party Name Input + Find Case Action Button Row
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 32,
                  child: TextField(
                    controller: _partyController,
                    style: const TextStyle(fontSize: 11, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Type Party Name / Case Title',
                      hintStyle: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      filled: true,
                      fillColor: AppColors.appBackground,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.borderSlate),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.borderSlate),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.primaryBlue, width: 1.5),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _triggerSearch,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0F172A),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  minimumSize: const Size(0, 32),
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  elevation: 0,
                ),
                icon: const Icon(Icons.search, size: 12),
                label: const Text(
                  'Find Case',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Direct Login Form component for Search Portal
class _SearchPortalLoginForm extends StatefulWidget {
  const _SearchPortalLoginForm({Key? key}) : super(key: key);

  @override
  State<_SearchPortalLoginForm> createState() => _SearchPortalLoginFormState();
}

class _SearchPortalLoginFormState extends State<_SearchPortalLoginForm> {
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
            content: Text('Welcome, ${_nameController.text.trim()}! Search portal unlocked.'),
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
              'Sign in to access the legal search portal & case repositories.',
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
                    : const Text('Sign In to Unlock Search', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
