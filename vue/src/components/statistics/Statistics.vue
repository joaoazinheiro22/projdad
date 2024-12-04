<template>
  <div>
    <h1>Statistics</h1>
    <div v-if="isAdmin">
      <h2>Admin Statistics</h2>
      <p>Total Purchases: {{ adminStats.totalPurchases }}</p>
      <h3>Purchases by Player</h3>
      <StatisticsChart :chartData="adminChartData" />
    </div>
    <div>
      <h2>Generic Statistics</h2>
      <StatisticsChart :chartData="genericChartData" />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import StatisticsChart from './StatisticsChart.vue';

export default {
  components: {
    StatisticsChart
  },
  setup() {
    const authStore = useAuthStore();
    const isAdmin = computed(() => authStore.user && authStore.userType === 'A');
    const genericStats = ref({});
    const adminStats = ref({});
    const errorMessage = ref('');

    const fetchGenericStats = async () => {
      try {
        const response = await axios.get('/stats/generic');
        genericStats.value = response.data;
      } catch (error) {
        errorMessage.value = 'Failed to fetch generic stats';
        console.error(error);
      }
    };

    const fetchAdminStats = async () => {
      try {
        const response = await axios.get('/stats/admin');
        adminStats.value = response.data;
      } catch (error) {
        errorMessage.value = 'Failed to fetch admin stats';
        console.error(error);
      }
    };

    const genericChartData = computed(() => ({
      labels: ['Total Players', 'Total Games', 'Games Last Week', 'Games Last Month'],
      datasets: [
        {
          label: 'Generic Statistics',
          backgroundColor: '#42A5F5',
          data: [
            genericStats.value.totalPlayers,
            genericStats.value.totalGames,
            genericStats.value.gamesLastWeek,
            genericStats.value.gamesLastMonth
          ]
        }
      ]
    }));

    const adminChartData = computed(() => {
      const purchasesByPlayer = adminStats.value.purchasesByPlayer || [];
      return {
        labels: purchasesByPlayer.map(player => player.user_id),
        datasets: [
          {
            label: 'Purchases by Player',
            backgroundColor: '#66BB6A',
            data: purchasesByPlayer.map(player => player.total)
          }
        ]
      };
    });

    onMounted(() => {
      fetchGenericStats();
      if (isAdmin.value) {
        fetchAdminStats();
      }
    });

    return {
      isAdmin,
      genericStats,
      adminStats,
      genericChartData,
      adminChartData,
      errorMessage
    };
  }
};
</script>

<style scoped>
/* Add any styles you need for your statistics page */
</style>