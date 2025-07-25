// outdoor-units-detailed.csv 데이터를 기반으로 한 초기 데이터
export const csvData = [
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-1호-CDU1' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-1호-CDU2' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-1호-CDU3' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-1호-CDU4' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-1호-CDU5' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-1호-CDU6' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-2호-CDU1' },
  { factoryName: '전자소재3공장', location: 'H1', name: 'AHU-H1-2호-CDU2' },
  { factoryName: '전자소재3공장', location: 'H2', name: 'AHU-H2-1호-CDU1' },
  { factoryName: '전자소재3공장', location: 'H2', name: 'AHU-H2-1호-CDU2' },
  { factoryName: '전자소재3공장', location: 'H2', name: 'AHU-H2-2호-CDU1' },
  { factoryName: '전자소재3공장', location: 'H2', name: 'AHU-H2-2호-CDU2' },
  { factoryName: '전자소재3공장', location: 'D1', name: 'AHU-D1-1-1' },
  { factoryName: '전자소재3공장', location: 'D1', name: 'AHU-D1-1-2' },
  { factoryName: '전자소재3공장', location: 'D1', name: 'AHU-D1-2-1' },
  { factoryName: '전자소재3공장', location: 'D1', name: 'AHU-D1-2-2' },
  { factoryName: '전자소재3공장', location: 'D2', name: 'AHU-D2-1-1' },
  { factoryName: '전자소재3공장', location: 'D2', name: 'AHU-D2-1-2' },
  { factoryName: '전자소재3공장', location: 'D2', name: 'AHU-D2-2-1' },
  { factoryName: '전자소재3공장', location: 'D2', name: 'AHU-D2-2-2' },
  { factoryName: '전자소재3공장', location: 'D3', name: 'AHU-D3-1-1' },
  { factoryName: '전자소재3공장', location: 'D3', name: 'AHU-D3-1-2' },
  { factoryName: '전자소재3공장', location: 'D3', name: 'AHU-D3-2-1' },
  { factoryName: '전자소재3공장', location: 'D3', name: 'AHU-D3-2-2' },
  { factoryName: '전자소재3공장', location: 'D3', name: 'AHU-D3-3-1' },
  { factoryName: '전자소재3공장', location: 'D3', name: 'AHU-D3-3-2' },
  { factoryName: '전자소재3공장', location: 'OAC', name: 'OAC-1-1-1' },
  { factoryName: '전자소재3공장', location: 'OAC', name: 'OAC-1-1-2' },
  { factoryName: '전자소재3공장', location: 'OAC', name: 'OAC-1-1-3' },
  { factoryName: '전자소재3공장', location: 'OAC', name: 'OAC-2-1-1' },
  { factoryName: '전자소재3공장', location: 'OAC', name: 'OAC-2-1-2' },
  { factoryName: '전자소재3공장', location: 'OAC', name: 'OAC-2-1-3' },
  { factoryName: '전자소재3공장', location: 'PID', name: 'PID AHU 1-1' },
  { factoryName: '전자소재3공장', location: 'PID', name: 'PID AHU 1-2' },
  { factoryName: '전자소재3공장', location: 'PID', name: 'PID AHU 1-3' },
  { factoryName: '전자소재3공장', location: 'PID', name: 'PID AHU 1-4' },
  { factoryName: '전자소재3공장', location: 'PID', name: 'PID AHU 2-1' },
  { factoryName: '전자소재3공장', location: 'PID', name: 'PID AHU 2-2' },
  { factoryName: '전자소재3공장', location: '타발', name: '타발1-1' },
  { factoryName: '전자소재3공장', location: '타발', name: '타발1-2' },
  { factoryName: '전자소재3공장', location: '기타', name: '재용창고 AHU 1 CDU1' },
  { factoryName: '전자소재3공장', location: '기타', name: '저온창고 CDU1' },
  { factoryName: '전자소재3공장', location: '기타', name: '저온창고 CDU2' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-3 PC#1' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-3 PC#2' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-2 CDU1' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-2 CDU2' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-1 CDU1' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-1 CDU2' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-3 AC#1' },
  { factoryName: '전자소재6공장', location: '옥외', name: 'AHU-3 AC#2' },
  { factoryName: '전자소재6공장', location: '4층 옥상', name: 'AHU-1 CDU1' },
  { factoryName: '전자소재6공장', location: '4층 옥상', name: 'AHU-1 CDU2' },
  { factoryName: '전자소재6공장', location: '4층 옥상', name: 'AHU-2 CDU1' },
  { factoryName: '전자소재6공장', location: '4층 옥상', name: 'AHU-2 CDU2' },
  { factoryName: '전자소재6공장', location: 'QA1-1창고', name: 'QA1-1' },
  { factoryName: '전자소재6공장', location: 'QA1-1창고', name: 'QA1-2' },
  { factoryName: '전자소재6공장', location: 'QA1-2창고', name: 'QA2-1' },
  { factoryName: '전자소재6공장', location: 'QA1-2창고', name: 'QA2-1' },
  { factoryName: '전자소재7공장', location: '', name: '가동 1-1' },
  { factoryName: '전자소재7공장', location: '', name: '가동 1-2' },
  { factoryName: '전자소재7공장', location: '', name: '가동 2-1' },
  { factoryName: '전자소재7공장', location: '', name: '가동 2-2' },
  { factoryName: '전자소재7공장', location: '', name: '4-1' },
  { factoryName: '전자소재7공장', location: '', name: '4-2' },
  { factoryName: '전자소재7공장', location: '', name: '4-3' },
  { factoryName: '전자소재7공장', location: '', name: '4-4' },
  { factoryName: '전자소재7공장', location: '', name: '5-1' },
  { factoryName: '전자소재7공장', location: '', name: '5-2' },
  { factoryName: '전자소재7공장', location: '', name: '6-1' },
  { factoryName: '전자소재7공장', location: '', name: '6-2' },
  { factoryName: '전자소재7공장', location: '', name: '7-1' },
  { factoryName: '전자소재7공장', location: '', name: '7-2' },
  { factoryName: '전자소재7공장', location: '', name: '7-3' },
  { factoryName: '전자소재7공장', location: '', name: '7-4' },
  { factoryName: '전자소재7공장', location: '', name: '8-1' },
  { factoryName: '전자소재7공장', location: '', name: '8-2' },
  { factoryName: '전자소재7공장', location: '', name: '8-3' },
  { factoryName: '전자소재7공장', location: '', name: '8-4' },
  { factoryName: '전자소재7공장', location: '', name: '9-A' },
  { factoryName: '전자소재7공장', location: '', name: '9-B' },
  { factoryName: '전자소재8공장', location: '', name: '항온항습기 CDU1' },
  { factoryName: '전자소재8공장', location: '', name: '항온항습기 CDU2' },
  { factoryName: '전자소재8공장', location: '', name: '항온항습기 2 CDU1' },
  { factoryName: '전자소재8공장', location: '', name: '항온항습기 2 CDU2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-2 AC 1-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-2 AC 1-2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-2 PC 1-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-2 PC 1-2' },
  { factoryName: '전자소재8공장', location: '', name: 'AHU-1 1F CDE #1' },
  { factoryName: '전자소재8공장', location: '', name: 'AHU-1 1F CDE #2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-1 1F AC 1-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-1 1F AC 1-2' },
  { factoryName: '전자소재8공장', location: '외부', name: 'DHU-1-1 1F RC' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1-1 1F PC' },
  { factoryName: '전자소재8공장', location: '', name: '2F옥외 2F CDU3' },
  { factoryName: '전자소재8공장', location: '', name: '2F옥외 2F CDU1' },
  { factoryName: '전자소재8공장', location: '', name: '4F 옥외 냉동기 1' },
  { factoryName: '전자소재8공장', location: '옥상(북서)', name: '4F 옥외 냉동기 2' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU2 CDU1' },
  { factoryName: '전자소재8공장', location: '옥상(서)', name: '4F AHU2 CDU2' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU3 CDU1' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU3 CDU2' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU3 CDU3' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU3 CDU4' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU4 CDU1' },
  { factoryName: '전자소재8공장', location: '', name: '4F AHU4 CDU2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F PC1-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F PC1-2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F PC2-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F PC2-2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F AC1-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F AC1-2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F AC2-1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-3 4F옥상R 3F AC2-2' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 BCU(승화1실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 BCU(승화2실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 BCU(승화3실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 BCU(승화4실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 4BCU(승화5실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 1BCU(승화6실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 3BCU(승화7실)' },
  { factoryName: '전자소재8공장', location: '', name: '승화실 2BCU(승화8실)' },
  { factoryName: '전자소재8공장', location: '', name: 'SDU SRT' },
  { factoryName: '전자소재8공장', location: '', name: '2F P/C 1-1' },
  { factoryName: '전자소재8공장', location: '', name: '2F P/C 1-2' },
  { factoryName: '전자소재8공장', location: '', name: '2F P/C 2-1' },
  { factoryName: '전자소재8공장', location: '', name: '2F P/C 2-2' },
  { factoryName: '전자소재8공장', location: '', name: '2F A/C 1-1' },
  { factoryName: '전자소재8공장', location: '', name: '2F A/C 1-2' },
  { factoryName: '전자소재8공장', location: '', name: '2F R/C #1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1902 에프터글로리 CDU1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1902 에프터글로리 CDU2' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1902 프리글로리 CDU1' },
  { factoryName: '전자소재8공장', location: '', name: 'DHU-1902 프리글로리 CDU2' },
  { factoryName: '전자소재8공장', location: '옷빚 1층', name: 'DHU-1901 3F CDU1' },
  { factoryName: '전자소재8공장', location: '옷빚 1층', name: 'DHU-1901 3F CDU2' },
  { factoryName: '전자소재8공장', location: '옷빚 1층', name: 'DHU-1901 3F CDU3' },
  { factoryName: '전자소재8공장', location: '옷빚 1층', name: 'DHU-1901 3F CDU4' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1901 3F옥상 CDU1' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1901 3F옥상 CDU2' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1901 3F옥상 CDU3' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1902 3F옥상 CDU1' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1902 3F옥상 CDU2' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1902 3F옥상 CDU3' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1903 3F옥상 CDU1' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1903 3F옥상 CDU2' },
  { factoryName: '전자소재9공장', location: '외부', name: 'AHU-1903 3F옥상 CDU3' },
  { factoryName: '전자소재9공장', location: '1F외부', name: 'AHU-1904 3F옥상 CDU1' },
  { factoryName: '전자소재9공장', location: '1F외부', name: 'AHU-1904 3F옥상 CDU2' },
  { factoryName: '전자소재9공장', location: '1F외부', name: 'AHU-1904 3F옥상 CDU3' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1905 1F옥외 CDU1' },
  { factoryName: '전자소재9공장', location: '', name: 'AHU-1905 1F옥외 CDU2' },
  { factoryName: '전자소재9공장', location: '', name: 'DHU-1902 에프터글로리 CDU1' },
  { factoryName: '전자소재9공장', location: '', name: 'DHU-1902 에프터글로리 CDU2' },
  { factoryName: '전자소재9공장', location: '', name: 'DHU-1902 프리글로리 CDU1' },
  { factoryName: '전자소재9공장', location: '', name: 'DHU-1902 프리글로리 CDU2' },
  { factoryName: '부설연구소', location: '정면1층', name: 'AHU CDU01' },
  { factoryName: '부설연구소', location: '정면1층', name: 'AHU CDU02' },
  { factoryName: '부설연구소', location: '정면1층', name: 'AHU CDU03' },
  { factoryName: '부설연구소', location: '정면1층', name: 'OAC CDU01' },
  { factoryName: '부설연구소', location: '정면1층', name: 'OAC CDU02' },
  { factoryName: '부설연구소', location: '정면1층', name: '공정평가실1' },
  { factoryName: '부설연구소', location: '정면1층', name: '공정평가실2' },
  { factoryName: '부설연구소', location: '옷빚1층', name: 'C104 항온항습기 1' },
  { factoryName: '부설연구소', location: '옷빚1층', name: 'C104 항온항습기 2' },
  { factoryName: '부설연구소', location: '옥상', name: 'C102 항온항습기 1' },
  { factoryName: '부설연구소', location: '옥상', name: 'C106 LTC 항온항습기' },
  { factoryName: '부설연구소', location: '옥상', name: 'C110 멀티고어식 항온항습기' },
  { factoryName: '부설연구소', location: '옥상', name: 'C112 멀티고어식 항온항습기' },
  { factoryName: '부설연구소', location: '옥상', name: 'C107 항온항습기' },
  { factoryName: '부설연구소', location: '옥상', name: 'C109 항온항습기1' },
  { factoryName: '부설연구소', location: '옥상', name: 'C109 항온항습기2' },
  { factoryName: '부설연구소', location: '옥상', name: 'C211 항온항습기1' },
  { factoryName: '부설연구소', location: '옥상', name: 'C211 항온항습기2' }
];