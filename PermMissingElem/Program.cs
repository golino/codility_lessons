using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PermMissingElem
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] A = new int[] { 2 };
			// 1 2 3 4 5
			Console.WriteLine("O resultaado é: {0}", solution(A));
			Console.ReadLine();
		}
		public static int solution(int[] A)
		{
			if (A.Length == 0)
				return 1;

			if (A.Length > 100000)
				return A[A.Length - 1] + 1;

			int maxVal = A[0], minVal = A[0], sum = 0, sum2 = 0;

			for (int i = 0; i < A.Length; i++)
			{
				if (A[i] > maxVal)
					maxVal = A[i];
				else if (A[i] < minVal)
					minVal = A[i];

				sum += A[i];
			}

			if (minVal == maxVal)
			{
				if (minVal > 1)
					return 1;
				else
					return minVal + 1;
			}

			if (minVal > 1)
				return 1;

			if (minVal + maxVal == A.Length + 1)
				return maxVal + 1;

			for (int i = minVal; i <= maxVal; i++)
			{
				sum2 += i;
			}

			return sum2 - sum;
		}
	}
}
