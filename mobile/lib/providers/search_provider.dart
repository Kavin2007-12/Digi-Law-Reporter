import 'dart:async';
import 'package:flutter/material.dart';
import '../models/case_model.dart';
import '../services/api_service.dart';

class SearchProvider extends ChangeNotifier {
  List<CaseModel> _cases = [];
  bool _isLoading = false; // Permanently false for zero skeleton flicker
  String _selectedMode = 'general';
  String _selectedCourt = '';
  String _searchQuery = '';
  String _selectedYear = '';
  Timer? _debounceTimer;

  List<CaseModel> get cases => _cases;
  bool get isLoading => false;
  String get selectedMode => _selectedMode;
  String get selectedCourt => _selectedCourt;
  String get searchQuery => _searchQuery;
  String get selectedYear => _selectedYear;

  SearchProvider() {
    _cases = ApiService.searchCasesSync(
      query: _searchQuery,
      mode: _selectedMode,
      court: _selectedCourt,
      year: _selectedYear,
    );
    performSearch();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

  void setMode(String mode) {
    _selectedMode = mode;
    performSearch();
  }

  void setCourt(String court) {
    if (_selectedCourt == court) {
      _selectedCourt = '';
    } else {
      _selectedCourt = court;
    }
    performSearch();
  }

  void setQuery(String query, {bool immediate = false}) {
    _searchQuery = query;
    _debounceTimer?.cancel();

    if (immediate || query.isEmpty) {
      performSearch();
    } else {
      _debounceTimer = Timer(const Duration(milliseconds: 200), () {
        performSearch();
      });
    }
  }

  void setQueryAndCourt(String query, String court) {
    _searchQuery = query;
    _selectedCourt = court;
    performSearch();
  }

  void setYear(String year) {
    _selectedYear = year;
    performSearch();
  }

  Future<void> performSearch() async {
    final results = await ApiService.searchCases(
      query: _searchQuery,
      mode: _selectedMode,
      court: _selectedCourt,
      year: _selectedYear,
    );

    _cases = results;
    notifyListeners();
  }
}
