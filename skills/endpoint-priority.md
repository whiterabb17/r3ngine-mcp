# Endpoint prioritization

Prefer endpoints that:
- Appear on critical/high vulns
- Have parameters
- Look like admin/API/login paths from the URL alone (no guessing beyond the string)

Singular tools: `nuclei_scan`, `dir_file_fuzz`, `url-vuln` workflow via plan steps.
