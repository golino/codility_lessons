using System;
using Xunit;
using Distinct;

namespace Codility.XUnit
{
	public class UnitTest1
	{
		private Solution solution;

		[Fact]
		public void Instancia()
		{
			solution = new Solution();
			Assert.IsType(typeof(Solution), solution);
		}

		[Fact]
		public void MaiorQueUmMenorQueCemMil()
		{
			int[] n1 = new int[0];

			Instancia();

			Assert.Equal(0, solution.solution(n1));

			int[] n2 = new int[100001];

			Assert.Equal(0, solution.solution(n2));
		}
		[Fact]
		public void TestaPadrao()
		{
			int[] a = new int[] { 2, 1, 1, 2, 3, 1 };
			Instancia();

			Assert.Equal(3, solution.solution(a));
		}
	}
}
