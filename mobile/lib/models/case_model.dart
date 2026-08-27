class CaseModel {
  final String id;
  final String title;
  final String court;
  final String year;
  final String citation;
  final String headnote;
  final String content;
  final String appellant;
  final String respondent;
  final String judge;
  final String act;
  final String decisionDate;
  final bool isSaved;

  CaseModel({
    required this.id,
    required this.title,
    required this.court,
    required this.year,
    required this.citation,
    required this.headnote,
    required this.content,
    this.appellant = '',
    this.respondent = '',
    this.judge = '',
    this.act = '',
    this.decisionDate = '',
    this.isSaved = false,
  });

  factory CaseModel.fromJson(Map<String, dynamic> json) {
    return CaseModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      title: json['title'] ?? json['case_name'] ?? 'Untitled Judgment',
      court: json['court'] ?? json['court_name'] ?? 'Supreme Court of India',
      year: json['year']?.toString() ?? json['judgment_year']?.toString() ?? '2026',
      citation: json['citation'] ?? json['citation_number'] ?? 'DLR 2026 SC 101',
      headnote: json['headnote'] ?? json['head_note'] ?? json['summary'] ?? '',
      content: json['content'] ?? json['judgment_text'] ?? json['full_text'] ?? '',
      appellant: json['appellant'] ?? '',
      respondent: json['respondent'] ?? '',
      judge: json['judge'] ?? json['coram'] ?? '',
      act: json['act'] ?? json['act_name'] ?? '',
      decisionDate: json['decisionDate'] ?? json['decision_date'] ?? '',
      isSaved: json['isSaved'] ?? false,
    );
  }

  CaseModel copyWith({bool? isSaved}) {
    return CaseModel(
      id: id,
      title: title,
      court: court,
      year: year,
      citation: citation,
      headnote: headnote,
      content: content,
      appellant: appellant,
      respondent: respondent,
      judge: judge,
      act: act,
      decisionDate: decisionDate,
      isSaved: isSaved ?? this.isSaved,
    );
  }
}
