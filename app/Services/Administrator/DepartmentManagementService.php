<?php

namespace App\Services\Administrator;

use App\Data\Administrator\DepartmentManagementListFilter\DepartmentEmployeeCandidateFilter;
use App\Data\Administrator\DepartmentManagementListFilter\DepartmentPageFilter;
use App\Repositories\Administrator\DepartmentManagementRepository;
use Illuminate\Http\Request;

class DepartmentManagementService
{
    public function __construct(
        private readonly DepartmentManagementRepository $repository,
    ) {}

    public function pageData(Request $request): array
    {
        $filter = DepartmentPageFilter::fromRequest($request);

        return [
            'office_heads' => fn () => $this->repository->headRows('unit_head'),
            'filtered_office_heads' => fn () => $this->repository->headRows('unit_head', $filter->officeSearch),
            'officeHeadRows' => fn () => $this->repository->officeHeadRowsPage(
                $filter->officeSearch,
                $filter->officeHeadLimit,
                $filter->officeHeadPage,
                $filter->officeHeadOfficeId,
            ),
            'division_heads' => fn () => $this->repository->headRows('division_head'),
            'filtered_division_heads' => fn () => $this->repository->headRows('division_head', $filter->divisionSearch),
            'divisions' => fn () => $this->repository->divisions(),
            'divisionList' => fn () => $this->repository->divisionRowsPage(
                $filter->divisionSearch,
                $filter->divisionLimit,
                $filter->divisionPage,
            ),
            'divisionHeadRows' => fn () => $this->repository->divisionHeadRowsPage(
                $filter->divisionSearch,
                $filter->divisionHeadLimit,
                $filter->divisionHeadPage,
            ),
            'offices' => fn () => $this->repository->offices(),
            'officeList' => fn () => $this->repository->officeRowsPage(
                '',
                $filter->officeLimit,
                $filter->officePage,
            ),
            'office_search' => $filter->officeSearch,
            'division_search' => $filter->divisionSearch,
            'officeLimit' => $filter->officeLimit,
            'officeHeadLimit' => $filter->officeHeadLimit,
            'divisionPage' => $filter->divisionPage,
            'divisionLimit' => $filter->divisionLimit,
            'divisionHeadPage' => $filter->divisionHeadPage,
            'divisionHeadLimit' => $filter->divisionHeadLimit,
            'addDivisionModal' => fn () => $this->isModal($request, 'add-division'),
            'addOfficeModal' => fn () => $this->isModal($request, 'add-office'),
            'editDivisionModal' => fn () => $this->divisionModal($request, 'edit-division'),
            'editOfficeModal' => fn () => $this->officeModal($request, 'edit-office'),
            'deleteOfficeModal' => fn () => $this->officeModal($request, 'delete-office'),
            'assignOfficeHeadModal' => fn () => $this->assignOfficeHeadModal($request),
            'assignDivisionHeadModal' => fn () => $this->assignDivisionHeadModal($request),
            'deleteOfficeHeadModal' => fn () => $this->headModal($request, 'delete-office-head', 'unit_head'),
            'deleteDivisionHeadModal' => fn () => $this->headModal($request, 'delete-division-head', 'division_head'),
        ];
    }

    public function officeHeadRows(DepartmentPageFilter $filter): array
    {
        return [
            'officeHeadRows' => $this->repository->officeHeadRowsPage(
                $filter->officeSearch,
                $filter->officeHeadLimit,
                $filter->officeHeadPage,
                $filter->officeHeadOfficeId,
            ),
            'office_search' => $filter->officeSearch,
            'officeHeadLimit' => $filter->officeHeadLimit,
        ];
    }

    public function officeHeadSuggestions(string $search): array
    {
        return $this->repository->officeHeadSuggestions(
            $search,
            DepartmentPageFilter::HEAD_LIMIT,
        );
    }

    public function employeeCandidates(DepartmentEmployeeCandidateFilter $filter): array
    {
        return $this->repository->employeeCandidates($filter);
    }

    public function storeOfficeHead(array $data): void
    {
        $office = $this->repository->office((int) $data['office_id']);
        $employee = $this->repository->employeeWithOffice((int) $data['employee_id']);

        if ((string) $employee->office_id !== (string) $office->id) {
            throw new \InvalidArgumentException('The selected employee must belong to the selected office.');
        }

        $this->repository->upsertHead(
            [
                'office_id' => $office->id,
                'type' => 'unit_head',
            ],
            [
                'division_id' => $office->division_id,
                'employee_id' => $employee->id,
            ],
        );
    }

    public function storeDivisionHead(array $data): void
    {
        $this->repository->employeeWithOffice((int) $data['employee_id']);

        $this->repository->upsertHead(
            [
                'division_id' => $data['division_id'],
                'type' => 'division_head',
            ],
            [
                'employee_id' => $data['employee_id'],
                'office_id' => null,
            ],
        );
    }

    public function deleteHead(int $id): void
    {
        $this->repository->divisionHead($id)->delete();
    }

    public function deleteDivisionHead(int $id): void
    {
        $this->repository->typedDivisionHead($id, 'division_head')->delete();
    }

    public function storeDivision(array $data): void
    {
        $this->repository->createDivision([
            'code' => $data['code'],
            'name' => $data['name'],
        ]);
    }

    public function updateDivision(int $id, array $data): void
    {
        $this->repository->division($id)->update([
            'code' => $data['code'],
            'name' => $data['name'],
        ]);
    }

    public function deleteDivision(int $id): void
    {
        $this->repository->division($id)->delete();
    }

    public function storeOffice(array $data): void
    {
        $this->repository->createOffice([
            'division_id' => $data['division_id'],
            'name' => $data['name'],
        ]);
    }

    public function updateOffice(int $id, array $data): void
    {
        $this->repository->office($id)->update([
            'division_id' => $data['division_id'],
            'name' => $data['name'],
        ]);
    }

    public function deleteOffice(int $id): void
    {
        $this->repository->office($id)->delete();
    }

    private function officeModal(Request $request, string $modal): ?array
    {
        if (! $this->isModal($request, $modal)) {
            return null;
        }

        $office = $this->repository->officeModal((int) $request->query('office_id'));

        if (! $office) {
            return null;
        }

        return [
            'id' => $office->id,
            'division_id' => $office->division_id,
            'name' => $office->name,
            'division' => $office->division,
        ];
    }

    private function divisionModal(Request $request, string $modal): ?array
    {
        if (! $this->isModal($request, $modal)) {
            return null;
        }

        $division = $this->repository->divisionModal((int) $request->query('division_id'));

        if (! $division) {
            return null;
        }

        return [
            'id' => $division->id,
            'code' => $division->code,
            'name' => $division->name,
        ];
    }

    private function headModal(Request $request, string $modal, string $type): ?array
    {
        if (! $this->isModal($request, $modal)) {
            return null;
        }

        $head = $this->repository->headModal((int) $request->query('head_id'), $type);

        if (! $head) {
            return null;
        }

        if ($type === 'unit_head') {
            return [
                'id' => $head->id,
                'employee' => $head->employee,
                'office_name' => $head->employee?->office?->name,
                'division_name' => $head->employee?->office?->division?->name,
            ];
        }

        return [
            'id' => $head->id,
            'employee' => $head->employee,
            'division_code' => $head->division?->code,
            'division_name' => $head->division?->name,
        ];
    }

    private function assignOfficeHeadModal(Request $request): ?array
    {
        if (! $this->isModal($request, 'assign-office-head')) {
            return null;
        }

        $office = $this->repository->officeModal((int) $request->query('office_id'));

        if (! $office) {
            return null;
        }

        return [
            'office_id' => $office->id,
            'office_name' => $office->name,
            'division_name' => $office->division?->name,
        ];
    }

    private function assignDivisionHeadModal(Request $request): ?array
    {
        if (! $this->isModal($request, 'assign-division-head')) {
            return null;
        }

        $divisionName = trim((string) $request->query('division_name', ''));

        if ($divisionName === '') {
            return null;
        }

        $division = $this->repository->divisionByNameOrCode($divisionName);

        if (! $division) {
            return null;
        }

        return [
            'division_id' => $division->id,
            'division_code' => $division->code,
            'division_name' => $division->name,
        ];
    }

    private function isModal(Request $request, string $modal): bool
    {
        return $request->query('modal') === $modal;
    }
}
