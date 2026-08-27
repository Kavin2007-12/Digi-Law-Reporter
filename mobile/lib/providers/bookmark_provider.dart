import 'package:flutter/material.dart';
import '../models/case_model.dart';

class BookmarkProvider extends ChangeNotifier {
  final Map<String, CaseModel> _savedCases = {};

  List<CaseModel> get savedCases => _savedCases.values.toList();

  bool isCaseSaved(String id) {
    return _savedCases.containsKey(id);
  }

  void toggleSaveCase(CaseModel caseItem) {
    if (_savedCases.containsKey(caseItem.id)) {
      _savedCases.remove(caseItem.id);
    } else {
      _savedCases[caseItem.id] = caseItem.copyWith(isSaved: true);
    }
    notifyListeners();
  }
}
