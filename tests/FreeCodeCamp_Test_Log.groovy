          POST /api/issues/fcc-project
{
  issue_title: 'Faux Issue Title',
  issue_text: 'Functional Test - Required Fields Only',
  created_by: 'fCC'
}
{}
{}
          POST /api/issues/fcc-project
{
  issue_title: 'Faux Issue Title 2',
  issue_text: 'Functional Test - Every field filled in',
  created_by: 'fCC',
  assigned_to: 'Chai and Mocha'
}
{}
{}
          POST /api/issues/fcc-project
{ created_by: 'fCC' }
{}
{}
          400: required field(s) missing
          [object Object]
          POST /api/issues/get_issues_test_289051
{
  issue_text: 'Get Issues Test',
  created_by: 'fCC',
  issue_title: 'Faux Issue 1'
}
{}
{}
          POST /api/issues/get_issues_test_289051
{
  issue_text: 'Get Issues Test',
  created_by: 'fCC',
  issue_title: 'Faux Issue 2'
}
{}
{}
          POST /api/issues/get_issues_test_289051
{
  issue_text: 'Get Issues Test',
  created_by: 'fCC',
  issue_title: 'Faux Issue 3'
}
{}
{}
          GET /api/issues/get_issues_test_289051
{}
{}
{}
          POST /api/issues/get_issues_test_289392
{
  issue_title: 'To be Filtered',
  issue_text: 'Filter Issues Test',
  created_by: 'Alice',
  assigned_to: 'Bob'
}
{}
{}
          POST /api/issues/get_issues_test_289392
{
  issue_title: 'To be Filtered',
  issue_text: 'Filter Issues Test',
  created_by: 'Alice',
  assigned_to: 'Bob'
}
{}
{}
          400: required field(s) missing
          [object Object]
          POST /api/issues/fcc-project
{
  issue_title: 'Issue to be Updated',
  issue_text: 'Functional Test - Put target',
  created_by: 'fCC'
}
{}
{}
          PUT /api/issues/fcc-project
{ _id: '6435cc3aab21f859db37ecff', issue_text: 'New Issue Text' }
{}
{}
          GET /api/issues/fcc-project?_id=6435cc3aab21f859db37ecff
{}
{ _id: '6435cc3aab21f859db37ecff' }
{}
          PUT /api/issues/fcc-project
{}
{}
{}
          420: no update field(s) sent
          [object Object]
          PUT /api/issues/fcc-project
{ _id: '5f665eb46e296f6b9b6a504d' }
{}
{}
          420: no update field(s) sent
          [object Object]
          POST /api/issues/fcc-project
{
  issue_title: 'Issue to be Deleted',
  issue_text: 'Functional Test - Delete target',
  created_by: 'fCC'
}
{}
{}
          DELETE /api/issues/fcc-project
{ _id: '6435cc3aab21f859db37ed03' }
{}
{}
          successfull deleted
          DELETE /api/issues/fcc-project
{}
{}
{}
          404: error: missing _id
          [object Object]
          GET /_api/get-tests
{}
{}
{}
requested