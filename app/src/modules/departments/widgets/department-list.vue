<script>
import DepartmentListFilter from "../components/department-list-filter.vue";
import DepartmentListTable from "../components/department-list-table.vue";

export default {
  name: "department-list",
  components: {DepartmentListTable, DepartmentListFilter}
}
</script>

<template>
  <department-list-filter/>

  <department-list-table/>
</template>

<style scoped>

</style>
