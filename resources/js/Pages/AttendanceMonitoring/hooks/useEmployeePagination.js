export default function useEmployeePagination(employees = {}) {
    return {
        page: employees?.current_page || 1,
        pageCount: employees?.last_page || 1,
        total: employees?.total || 0,
        startIndex: employees?.from || 0,
        endIndex: employees?.to || 0,
    };
}
