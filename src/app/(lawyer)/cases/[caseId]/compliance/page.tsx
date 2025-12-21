'use client';

import { notFound, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import { Card, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Button } from '@/components/ui';
import { ComplianceSummary, RuleCheckList, ConflictDetector } from '@/components/compliance';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getCaseById } from '@/data/cases';
import { getIssuesByCaseId } from '@/data/issues';
import { getComplianceReportByCaseId } from '@/data/compliance';
import { ROUTES } from '@/data/constants';

export default function ComplianceEnginePage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const caseData = getCaseById(caseId);

  if (!caseData) {
    notFound();
  }

  const issues = getIssuesByCaseId(caseId);
  const report = getComplianceReportByCaseId(caseId);
  const logicIssues = issues.filter((i) => i.type === 'logic' && i.status === 'open');

  const handleResolveIssue = (issueId: string) => {
    console.log('Resolving issue:', issueId);
  };

  const handleRunChecks = () => {
    console.log('Running compliance checks...');
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Compliance Engine"
        subtitle={`${caseData.applicant.passport.givenNames} ${caseData.applicant.passport.surname} - ${caseData.referenceNumber}`}
        backHref={ROUTES.CASE_DETAIL(caseId)}
        breadcrumbs={[
          { label: 'Cases', href: ROUTES.CASES },
          { label: caseData.referenceNumber, href: ROUTES.CASE_DETAIL(caseId) },
          { label: 'Compliance Engine' },
        ]}
        actions={
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRunChecks}
          >
            Re-run Checks
          </Button>
        }
      />

      {/* Summary */}
      {report && (
        <div className="mb-6">
          <ComplianceSummary report={report} />
        </div>
      )}

      {/* Main Content */}
      <Card padding="none">
        <Tabs defaultValue="rules">
          <TabsList className="px-4 border-b border-gray-200">
            <TabsTrigger
              value="rules"
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Rule Checks
            </TabsTrigger>
            <TabsTrigger
              value="conflicts"
              icon={<AlertTriangle className="w-4 h-4" />}
              badge={
                logicIssues.length > 0 ? (
                  <Badge variant="error" size="sm">{logicIssues.length}</Badge>
                ) : undefined
              }
            >
              Conflicts
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="rules">
              {report ? (
                <RuleCheckList rules={report.rules} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No compliance report available.</p>
                  <p className="text-sm mt-1">Run compliance checks to generate a report.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="conflicts">
              <ConflictDetector issues={issues} onResolveIssue={handleResolveIssue} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
