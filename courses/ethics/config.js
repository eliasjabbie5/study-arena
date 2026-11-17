/* Course settings. Everything the engine needs to know about this course that is not questions or chapters. */
var CONFIG={
  key:"ethics-arena-v1",                       // localStorage key (kept identical so existing progress still loads)
  title:"Ethics Arena",
  subtitle:"Ethics & CSR · IÉSEG Paris · exam prep",
  course:"Ethics & CSR course at IESEG School of Management",   // used in the AI examiner prompt
  examName:"Ethics & CSR",                     // heading on the mock exam paper
  examFormat:"the 2025 annals",                // "written in the format of ..."
  examTotal:20,                                // points per mock paper
  ranks:[[0,"Intern"],[100,"Analyst"],[300,"Associate"],[600,"Manager"],[900,"Ethics Officer"],[1250,"Chief Ethics Officer"]],
  zshort:{csr:"CSR",theo:"Theories",beh:"Behaviour",mgmt:"Managing",ai:"AI",cases:"Cases"}   // short zone names for the radar chart
};
