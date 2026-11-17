/* Course settings. Everything the engine needs to know about this course that is not questions or chapters. */
var CONFIG={
  key:"ethics-arena-v1",                       // localStorage key (kept identical so existing progress still loads)
  title:"Ethics Arena",
  subtitle:"Business Ethics & Governance - Academic Exam Prep",
  course:"Business Ethics & CSR Course",   // used in the AI examiner prompt
  examName:"Ethics & CSR",                     // heading on the mock exam paper
  examFormat:"the 2025 annals",                // "written in the format of ..."
  examTotal:20,                                // points per mock paper
  ranks:[[0,"Foundational Standing"],[150,"Proficiency Standing"],[350,"Advanced Practice"],[650,"Executive Mastery"],[1000,"Distinction Honors"]],
  zshort:{csr:"CSR",theo:"Theories",beh:"Behaviour",mgmt:"Managing",ai:"AI",cases:"Cases"}   // short zone names for the radar chart
};
