using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CyclicRotation
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] v = new int[] { 1, 2, 99, 23 };
			// 1 2 3 4 5 6 7 8
			// 6 7 8 1 2 3 4 5
			int k = 73;

			StringBuilder sb1 = new StringBuilder();
			StringBuilder sb = new StringBuilder();

			int[] r = Solution(v, k);

			for (int i = 0; i < r.Length; i++)
			{
				sb1.Append(String.Format("{0} ", v[i]));
				sb.Append(String.Format("{0} ", r[i]));
			}

			Console.WriteLine(String.Format("Vetor inicial: {0}", sb1));
			Console.WriteLine(String.Format("Vetor deslocado {0} vezes: {1}", k, sb));
			Console.ReadLine();
		}

		public static int[] Solution(int[] A, int K)
		{
			if (K < 0 || K > 100 || A.Length == 0)
				return new int[] { };

			List<int> a2 = new List<int>();

			if (K > A.Length)
			{
				double n = (double)K / (double)A.Length;
				double rest = n % 1;
				double intPart = n - rest;
				double intTimes = intPart * A.Length;
				K = K - (int)intTimes;
			}

			if (K == 0)
				return A;

			for (int i = A.Length - K; i < A.Length; i++)
				a2.Add(A[i]);

			for (int i = 0; i < A.Length - K; i++)
				a2.Add(A[i]);

			return a2.ToArray();
		}
	}
}
